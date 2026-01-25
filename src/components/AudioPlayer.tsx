import { useState, useRef, useEffect, useCallback, memo } from "react";
import { shuffle } from "../helpers/global";
import { fetchSongList, fetchPlaylists } from "../services/music-service";
import "./CustomSelect.css";
import "./AudioPlayer.css";

const BATCH_SIZE = 5;
const STORAGE_KEY = "wtr98-audio-playlist";
const DEFAULT_PLAYLIST = "classic";

function getCdnUrl(key: string): string {
  const base = import.meta.env.VITE_MUSIC_CDN_URL as string | undefined;
  if (!base) throw new Error("VITE_MUSIC_CDN_URL is not set");
  return `${base.replace(/\/$/, "")}/${encodeURIComponent(key)}`;
}

function getSongName(key: string): string {
  // Extract just the filename from the path (e.g., "playlistname/songname.mp3" -> "songname")
  const filename = key.split("/").pop() || key;
  return filename.replace(/\.mp3$/i, "");
}

function Player() {
  const [allTracks, setAllTracks] = useState<string[]>([]);
  const [loadedTracks, setLoadedTracks] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>(DEFAULT_PLAYLIST);
  const [availablePlaylists, setAvailablePlaylists] = useState<string[]>([]);
  const [playlistsInitialized, setPlaylistsInitialized] = useState(false);
  const [shouldMarquee, setShouldMarquee] = useState(false);
  const nowPlayingRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shouldAutoPlayNextRef = useRef(false);
  const selectedPlaylistRef = useRef(selectedPlaylist);
  selectedPlaylistRef.current = selectedPlaylist;

  // Fetch available playlists on mount; init selection from localStorage or default to classic
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const playlists = await fetchPlaylists();
        setAvailablePlaylists(playlists);
        const stored = localStorage.getItem(STORAGE_KEY);
        let preferred =
          stored && playlists.includes(stored) ? stored : DEFAULT_PLAYLIST;
        if (!playlists.includes(preferred)) {
          preferred = playlists[0] ?? DEFAULT_PLAYLIST;
        }
        setSelectedPlaylist(preferred);
      } catch (e) {
        console.error("Failed to fetch playlists:", e);
        setSelectedPlaylist(DEFAULT_PLAYLIST);
      } finally {
        setPlaylistsInitialized(true);
      }
    };
    loadPlaylists();
  }, []);

  const loadPlaylist = useCallback(async (playlist: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const keys = await fetchSongList(playlist);
      if (selectedPlaylistRef.current !== playlist) return;
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
      if (selectedPlaylistRef.current !== playlist) return;
      setError(e instanceof Error ? e.message : "Failed to load playlist");
      setAllTracks([]);
      setLoadedTracks([]);
    } finally {
      if (selectedPlaylistRef.current === playlist) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!playlistsInitialized) return;
    loadPlaylist(selectedPlaylist);
  }, [selectedPlaylist, loadPlaylist, playlistsInitialized]);

  // Check if text overflows and enable marquee
  useEffect(() => {
    // Use a small timeout to ensure DOM has updated
    const timeoutId = setTimeout(() => {
      if (nowPlayingRef.current && textRef.current) {
        const container = nowPlayingRef.current;
        const text = textRef.current;
        const isOverflowing = text.scrollWidth > container.clientWidth;
        setShouldMarquee(isOverflowing);
        
        if (isOverflowing) {
          // Calculate the scroll distance: start from right (container width) to left (-text width)
          const containerWidth = container.clientWidth;
          const textWidth = text.scrollWidth;
          // Start at container width (left edge of text at right edge of container)
          // End at -textWidth (left edge of text at textWidth pixels left, so right edge is at left edge of container)
          text.style.setProperty('--scroll-start', `${containerWidth}px`);
          text.style.setProperty('--scroll-end', `-${textWidth}px`);
        } else {
          setShouldMarquee(false);
        }
      } else {
        setShouldMarquee(false);
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [currentIndex, loadedTracks, selectedPlaylist, isLoading, error]);

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
      const shouldPlay = wasPlaying || shouldAutoPlayNextRef.current;
      if (shouldPlay) {
        shouldAutoPlayNextRef.current = false;
        audio.play().catch((err) => {
          console.error("Auto-play error after track change:", err);
          setIsPlaying(false);
        });
      } else {
        shouldAutoPlayNextRef.current = false;
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
    shouldAutoPlayNextRef.current = true;
    setCurrentIndex((i) =>
      i < loadedTracks.length - 1 ? i + 1 : 0
    );
  };

  const handleError = () => {
    console.warn("Audio error, skipping to next");
    handleClickNext();
  };

  const handlePlaylistChange = (value: string) => {
    setSelectedPlaylist(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  // Determine what to display in the marquee (song name or status only)
  const getNowPlayingContent = () => {
    if (isLoading) {
      return "Loading playlist…";
    }
    if (error) {
      return error;
    }
    if (loadedTracks.length === 0) {
      return "No songs available";
    }
    const currentKey = loadedTracks[currentIndex];
    return getSongName(currentKey);
  };

  const hasTracks = loadedTracks.length > 0 && !isLoading && !error;

  return (
    <div className="minimal-audio-player">
      <div className="playlist-selector-row">
     
        <div className="window now-playing-window">
          <label className="now-playing-label" style={{ textAlign: "start", width: "100%", padding:'0 4px' }}>Now Playing:</label>
          <div className="now-playing" ref={nowPlayingRef}>
            <span
              ref={textRef}
              className={shouldMarquee && hasTracks ? "now-playing-text marquee" : "now-playing-text"}
            >
              {getNowPlayingContent()}
            </span>
          </div>
        </div>
        <div className="window">
          <label style={{ fontSize: "16px", textAlign: "start", width: "100%", padding:'0 4px' }} htmlFor="playlist-select">
             Playlist:
          </label>
          <div className="custom-select">
            <select
              id="playlist-select"
              value={selectedPlaylist}
              onChange={(e) => handlePlaylistChange(e.target.value)}
            >
              {availablePlaylists.map((playlist) => (
                <option key={playlist} value={playlist}>
                  {playlist}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {error && (
        <button
          type="button"
          className="audio-btn"
          onClick={() => loadPlaylist(selectedPlaylist)}
          style={{ marginTop: 8, width: "100%" }}
        >
          Retry
        </button>
      )}
      <div className="audio-controls">
        <button
          className="audio-btn audio-btn-prev"
          onClick={handleClickBack}
          disabled={isLoading || loadedTracks.length === 0}
          aria-label="Previous"
        >
          <span className="icon-prev"></span>
        </button>
        <button
          className="audio-btn audio-btn-play"
          onClick={handlePlayPause}
          disabled={isLoading || loadedTracks.length === 0}
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
          disabled={isLoading || loadedTracks.length === 0}
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

export default memo(Player);
