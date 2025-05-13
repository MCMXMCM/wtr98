import { useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { shuffle } from "../helpers/global";
import InfiniteMarquee from "./Marquee";

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
  const minimizedPreference = localStorage.getItem("minimizePlayer");

  const [currentTrack, setTrackIndex] = useState(0);
  const [minimized, setMinimized] = useState(
    Boolean(minimizedPreference) || false
  );

  const handleClickBack = () => {
    console.log("click back");
    setTrackIndex((currentTrack) => (currentTrack > 0 ? currentTrack - 1 : 0));
  };

  const handleClickNext = () => {
    console.log("click next");
    setTrackIndex((currentTrack) =>
      currentTrack < playlist.length - 1 ? currentTrack + 1 : 0
    );
  };

  const handleEnd = () => {
    console.log("end");
    setTrackIndex((currentTrack) =>
      currentTrack < playlist.length - 1 ? currentTrack + 1 : 0
    );
  };

  return (
    <div className="marquee">
      <InfiniteMarquee />

      <div className="title-bar" style={{ width: "100%" }}>
        <div className="title-bar-text">
          {" "}
          Now playing:{" "}
          {playlist[currentTrack].src
            .split("")
            .splice(7, playlist[currentTrack].src.length - 11)}
        </div>
        <div className="title-bar-controls">
          <button
            style={{ height: "25px", width: "25px" }}
            onClick={() => {
              localStorage.setItem("minimizePlayer", String(!minimized));
              setMinimized(!minimized);
            }}
            aria-label={minimized ? "Maximize" : "Minimize"}
          ></button>
        </div>
      </div>

      <div
        className="window"
        style={{
          width: "100%",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "12px",
          visibility: minimized ? "hidden" : "visible",
          height: minimized ? "0px" : "fit-content",
        }}
      >
        <AudioPlayer
          style={{
            visibility: minimized ? "hidden" : "visible",
            height: minimized ? "0px" : "80px",
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            boxShadow: "none",
          }}
          autoPlay
          customVolumeControls={[]}
          showJumpControls={false}
          src={playlist[currentTrack].src}
          showSkipControls
          onClickPrevious={handleClickBack}
          onClickNext={handleClickNext}
          onEnded={handleEnd}
          onError={() => {
            console.log("play error");
          }}
        />
      </div>
    </div>
  );
}
