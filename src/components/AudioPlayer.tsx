import { useState, useRef, useEffect } from "react";
import { shuffle } from "../helpers/global";
import "./AudioPlayer.css";

const playlist = [
  { src: "/music/Christopher Mason - Something Beautiful.mp3" },
  { src: "/music/Jim Horn - Divided Soul.mp3" },
  { src: "/music/Ben Sidran - Like Sonny.mp3" },
  { src: "/music/Bob Thompson - I Just Want You To Be Happy.mp3" },
  { src: "/music/George Benson And Earl Klugh - Mimosa.mp3" },
  { src: "/music/Dan Siegel - Celestial Body.mp3" },
  { src: "/music/George Howard - Broad Street.mp3" },
  { src: "/music/Birds Of A Feather - Down For The Count.mp3" },
  { src: "/music/Brian Bromberg - Magic Rain.mp3" },
  { src: "/music/Bill Shields - Sunset Breeze.mp3" },
  { src: "/music/Dave Grusin - Welcome To The Road.mp3" },
  { src: "/music/Dan Siegel - Distant Thoughts.mp3" },
  { src: "/music/Jim Horn - Neon Nights.mp3" },
  { src: "/music/George Howard - I Like This Groove.mp3" },
  { src: "/music/David Sanborn - Lets Just Say Goodbye.mp3" },
  { src: "/music/Dave Grusin And Lee Ritenour - Early A.M. Attitude.mp3" },
  { src: "/music/Dave Grusin - Punta Del Soul.mp3" },
];

shuffle(playlist);

export default function Player() {
  const [currentTrack, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = playlist[currentTrack].src;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch((err) => {
          console.log("Play error:", err);
        });
      }
    }
  }, [currentTrack]);

  const handleClickBack = () => {
    setTrackIndex((currentTrack) => (currentTrack > 0 ? currentTrack - 1 : playlist.length - 1));
  };

  const handleClickNext = () => {
    setTrackIndex((currentTrack) =>
      currentTrack < playlist.length - 1 ? currentTrack + 1 : 0
    );
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnd = () => {
    setTrackIndex((currentTrack) =>
      currentTrack < playlist.length - 1 ? currentTrack + 1 : 0
    );
  };

  const getSongName = (src: string) => {
    return src.replace("/music/", "").replace(".mp3", "");
  };

  return (
    <div className="minimal-audio-player">
      <div className="now-playing">
        Now Playing: {getSongName(playlist[currentTrack].src)}
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
        onEnded={handleEnd}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          console.log("play error");
        }}
      />
    </div>
  );
}
