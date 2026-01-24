import { useState, useRef, useEffect, useCallback } from "react";
import { shuffle } from "../helpers/global";
import { fetchSongList, fetchPlaylists } from "../services/music-service";
import "./AudioPlayer.css";

const BATCH_SIZE = 5;

function getCdnUrl(key: string): string {
  const base = import.meta.env.VITE_MUSIC_CDN_URL as string | undefined;
  if (!base) throw new Error("VITE_MUSIC_CDN_URL is not set");
  return `${base.replace(/\/$/, "")}/${encodeURIComponent(key)}`;
}

function getSongName(key: string): string {
  return key.replace(/\.mp3$/i, "");
}

export default function Player() {
  const [allTracks, setAllTracks] = useState<string[]>([]);
  const [loadedTracks, setLoadedTracks] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>("playlist 1");
  const [availablePlaylists, setAvailablePlaylists] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch available playlists on mount
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const playlists = await fetchPlaylists();
        setAvailablePlaylists(playlists);
        
        // If "playlist 1" is not available, default to first playlist or null (root)
        if (playlists.length > 0 && !playlists.includes("playlist 1")) {
          // Check if any playlist exists, otherwise default to root
          setSelectedPlaylist(playlists[0] || null);
        } else if (playlists.length === 0) {
          // No playlists found, default to root
          setSelectedPlaylist(null);
        }
      } catch (e) {
        console.error("Failed to fetch playlists:", e);
        // On error, default to root
        setSelectedPlaylist(null);
      }
    };
    
    loadPlaylists();
  }, []);

  const loadPlaylist = useCallback(async (playlist: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      let keys = await fetchSongList(playlist);
      
      // If playlist is empty, fallback to root
      if (playlist && keys.length === 0) {
        console.log(`Playlist "${playlist}" is empty, falling back to root`);
        keys = await fetchSongList(null);
      }
      
      if (keys.length === 0) {
        setError("No songs found");
        setAllTracks([]);
        setLoadedTracks([]);
        return;
      }
      const shuffled = shuffle(keys);
      setAllTracks(shuffled);
      setLoadedTracks(shuffled.slice(0, BATCH_SIZE));
      setCurrentIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load playlist");
      setAllTracks([]);
      setLoadedTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylist(selectedPlaylist);
  }, [selectedPlaylist, loadPlaylist]);

  useEffect(() => {
    if (loadedTracks.length === 0 || !audioRef.current) return;
    const key = loadedTracks[currentIndex];
    const url = getCdnUrl(key);
    console.log("Loading audio:", url);
    const wasPlaying = !audioRef.current.paused;
    const audio = audioRef.current;
    
    // Reset error state when loading new track
    setError(null);
    
    // Set source and load
    audio.src = url;
    audio.load();
    
    // Verify the source was set correctly
    if (!audio.src || audio.src === window.location.href) {
      console.error("Failed to set audio source, URL:", url);
      setError("Failed to load audio source");
      return;
    }
    
    const handleCanPlay = () => {
      console.log("Audio ready to play, readyState:", audio.readyState);
      if (wasPlaying) {
        audio.play().catch((err) => {
          console.error("Auto-play error after track change:", err);
          setIsPlaying(false);
        });
      }
      audio.removeEventListener("canplay", handleCanPlay);
    };
    
    const handleError = () => {
      console.error("Audio load error, src:", audio.src);
      if (audio.error) {
        console.error("Error code:", audio.error.code, "message:", audio.error.message);
      }
      setError("Failed to load audio file");
      audio.removeEventListener("error", handleError);
    };
    
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    
    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [currentIndex, loadedTracks]);

  useEffect(() => {
    if (allTracks.length === 0 || loadedTracks.length === 0) return;
    if (currentIndex < loadedTracks.length - 2) return;
    const nextStart = loadedTracks.length;
    const nextBatch = allTracks.slice(nextStart, nextStart + BATCH_SIZE);
    if (nextBatch.length === 0) return;
    setLoadedTracks((prev) => [...prev, ...nextBatch]);
  }, [currentIndex, allTracks, loadedTracks.length]);

  const handleClickBack = () => {
    if (loadedTracks.length === 0) return;
    setCurrentIndex((i) => (i > 0 ? i - 1 : loadedTracks.length - 1));
  };

  const handleClickNext = () => {
    if (loadedTracks.length === 0) return;
    setCurrentIndex((i) =>
      i < loadedTracks.length - 1 ? i + 1 : 0
    );
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || loadedTracks.length === 0) return;
    const audio = audioRef.current;
    
    // Check if audio has a valid source
    if (!audio.src || audio.src === window.location.href) {
      console.warn("Audio has no source, waiting for source to be set...");
      // Wait a bit for the source to be set by the useEffect
      setTimeout(() => {
        if (audio.src && audio.src !== window.location.href) {
          handlePlayPause();
        } else {
          console.error("Audio source still not set");
          setError("Audio source not ready. Please try again.");
        }
      }, 100);
      return;
    }
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Check if audio is ready
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (err) {
          console.error("Failed to play audio:", err);
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error("Error details:", {
            code: (err as any)?.code,
            name: (err as any)?.name,
            message: errorMsg,
            readyState: audio.readyState,
            networkState: audio.networkState,
            src: audio.src
          });
          setError(`Playback error: ${errorMsg}`);
        }
      } else {
        console.warn("Audio not ready, readyState:", audio.readyState, "src:", audio.src);
        // Wait for audio to be ready
        const handleCanPlay = async () => {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (err) {
            console.error("Failed to play after ready:", err);
            setError(`Playback error: ${err instanceof Error ? err.message : "Unknown error"}`);
          }
          audio.removeEventListener("canplay", handleCanPlay);
        };
        audio.addEventListener("canplay", handleCanPlay);
      }
    }
  };

  const handleEnd = () => {
    if (loadedTracks.length === 0) return;
    setCurrentIndex((i) =>
      i < loadedTracks.length - 1 ? i + 1 : 0
    );
  };

  const handleError = () => {
    console.warn("Audio error, skipping to next");
    handleClickNext();
  };

  const handlePlaylistChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedPlaylist(value === "" ? null : value);
  };

  if (isLoading) {
    return (
      <div className="minimal-audio-player">
        <div className="now-playing">Loading playlist…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="minimal-audio-player">
        <div className="now-playing">{error}</div>
        <button
          type="button"
          className="audio-btn"
          onClick={() => loadPlaylist(selectedPlaylist)}
          style={{ marginTop: 8 }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loadedTracks.length === 0) {
    return (
      <div className="minimal-audio-player">
        <div className="now-playing">No songs available</div>
      </div>
    );
  }

  const currentKey = loadedTracks[currentIndex];

  return (
    <div className="minimal-audio-player">
      <div className="playlist-selector-row">
        <select
          className="playlist-select"
          value={selectedPlaylist || ""}
          onChange={handlePlaylistChange}
          style={{
            fontSize: "12px",
            padding: "2px 4px",
            cursor: "pointer",
            flex: "0 0 auto",
            marginRight: "8px",
          }}
        >
          <option value="">Root</option>
          {availablePlaylists.map((playlist) => (
            <option key={playlist} value={playlist}>
              {playlist}
            </option>
          ))}
        </select>
        <div className="now-playing">
          Now Playing: {getSongName(currentKey)}
        </div>
      </div>
      <div className="audio-controls">
        <button
          className="audio-btn audio-btn-prev"
          onClick={handleClickBack}
          aria-label="Previous"
        >
          <span className="icon-prev"></span>
        </button>
        <button
          className="audio-btn audio-btn-play"
          onClick={handlePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <span className="icon-pause"></span>
          ) : (
            <span className="icon-play"></span>
          )}
        </button>
        <button
          className="audio-btn audio-btn-next"
          onClick={handleClickNext}
          aria-label="Next"
        >
          <span className="icon-next"></span>
        </button>
      </div>

      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={handleEnd}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.error("Audio element error:", e);
          const audio = e.currentTarget;
          if (audio.error) {
            console.error("Audio error code:", audio.error.code, "message:", audio.error.message);
          }
          handleError();
        }}
        onLoadedData={() => {
          console.log("Audio loaded successfully, src:", audioRef.current?.src);
        }}
        onCanPlay={() => {
          console.log("Audio can play, readyState:", audioRef.current?.readyState);
        }}
      />
    </div>
  );
}
