import { useState, useRef, useEffect, useLayoutEffect, useCallback, memo } from "react";
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
  return key.replace(/\.mp3$/i, "");
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
  const [shouldMarquee, setShouldMarquee] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  }>({ left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightedOptionRef = useRef<HTMLButtonElement | null>(null);
  const nowPlayingRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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
      }
    };
    loadPlaylists();
  }, []);

  const loadPlaylist = useCallback(async (playlist: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const keys = await fetchSongList(playlist);
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
          // Calculate the scroll distance: start from right (container width) to left (-overflow amount)
          const containerWidth = container.clientWidth;
          const textWidth = text.scrollWidth;
          const overflowAmount = textWidth - containerWidth;
          // Start at container width (text off-screen right), end at -overflowAmount (text off-screen left)
          text.style.setProperty('--scroll-start', `${containerWidth}px`);
          text.style.setProperty('--scroll-end', `-${overflowAmount}px`);
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

  const handlePlaylistChange = (value: string) => {
    setSelectedPlaylist(value);
    localStorage.setItem(STORAGE_KEY, value);
    setFilter("");
    setIsDropdownOpen(false);
  };

  const filteredPlaylists = availablePlaylists.filter((p) =>
    p.toLowerCase().includes(filter.toLowerCase())
  );

  // Position dropdown when it opens; keep within viewport (single useLayoutEffect so clamp isn’t overwritten)
  useLayoutEffect(() => {
    if (!isDropdownOpen || !triggerRef.current || !dropdownListRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const el = dropdownListRef.current;
    const gap = 2;
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(el.offsetWidth, vw - 2 * pad);
    const spaceBelow = vh - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openAbove = spaceAbove > spaceBelow;
    let left = Math.max(pad, Math.min(rect.left, vw - width - pad));
    if (openAbove) {
      setDropdownPosition({
        bottom: vh - (rect.top - gap),
        left,
      });
    } else {
      setDropdownPosition({
        top: rect.bottom + gap,
        left,
      });
    }
  }, [isDropdownOpen, availablePlaylists, filter]);

  useEffect(() => {
    if (isDropdownOpen) {
      setFilter("");
      setHighlightedIndex(0);
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filter]);

  useEffect(() => {
    const list = dropdownListRef.current;
    const opt = highlightedOptionRef.current;
    if (!list || !opt) return;
    const listRect = list.getBoundingClientRect();
    const optRect = opt.getBoundingClientRect();
    if (optRect.top < listRect.top) {
      list.scrollTop += optRect.top - listRect.top;
    } else if (optRect.bottom > listRect.bottom) {
      list.scrollTop += optRect.bottom - listRect.bottom;
    }
  }, [highlightedIndex, filteredPlaylists]);

  const handlePlaylistKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;
    const opts = filteredPlaylists;
    if (opts.length === 0) {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsDropdownOpen(false);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % opts.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + opts.length) % opts.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handlePlaylistChange(opts[highlightedIndex]);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
    }
  };

  // Close dropdown when clicking outside; clear filter on close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFilter("");
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // Dismiss dropdown on scroll (e.g. mobile), but not when scrolling inside the dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleScroll = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setFilter("");
      setIsDropdownOpen(false);
    };
    document.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => document.removeEventListener("scroll", handleScroll, { capture: true });
  }, [isDropdownOpen]);

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
          <div className="custom-select" ref={dropdownRef}>
            <div
              ref={triggerRef}
              className="custom-select-trigger custom-select-trigger--has-value"
              role="combobox"
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
              onClick={() => {
                if (!isDropdownOpen) {
                  setIsDropdownOpen(true);
                  inputRef.current?.focus({ preventScroll: true });
                }
              }}
            >
              <input
                ref={inputRef}
                id="playlist-select"
                type="text"
                className="custom-select-input"
                value={isDropdownOpen ? filter : selectedPlaylist}
                readOnly={!isDropdownOpen}
                onChange={(e) => isDropdownOpen && setFilter(e.target.value)}
                onKeyDown={handlePlaylistKeyDown}
                onFocus={() => {
                  if (!isDropdownOpen) setIsDropdownOpen(true);
                }}
                style={{ fontSize: "16px" }}
                placeholder={isDropdownOpen ? "Type to search…" : undefined}
                autoComplete="off"
              />
              <span className="custom-select-arrow">▼</span>
            </div>
            {isDropdownOpen && (
              <div
                ref={dropdownListRef}
                className="custom-select-dropdown"
                role="listbox"
                style={{
                  ...(dropdownPosition.top != null && {
                    top: `${dropdownPosition.top}px`,
                  }),
                  ...(dropdownPosition.bottom != null && {
                    bottom: `${dropdownPosition.bottom}px`,
                  }),
                  left: `${dropdownPosition.left}px`,
                }}
              >
                {filteredPlaylists.length === 0 ? (
                  <div className="custom-select-no-matches">No matches</div>
                ) : (
                  filteredPlaylists.map((playlist, i) => (
                    <button
                      key={playlist}
                      ref={i === highlightedIndex ? highlightedOptionRef : undefined}
                      type="button"
                      role="option"
                      aria-selected={selectedPlaylist === playlist || i === highlightedIndex}
                      className={`custom-select-option ${i === highlightedIndex ? "highlighted" : ""}`}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      onClick={() => handlePlaylistChange(playlist)}
                    >
                      {playlist}
                    </button>
                  ))
                )}
              </div>
            )}
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
