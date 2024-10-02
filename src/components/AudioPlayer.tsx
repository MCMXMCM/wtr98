import { useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { shuffle } from "../helpers/global";

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
    <div
      style={{
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "12px",
      }}
    >
      <p style={{ margin: 0 }}>
        Now playing:{" "}
        {playlist[currentTrack].src
          .split("")
          .splice(7, playlist[currentTrack].src.length - 11)}
      </p>
      <AudioPlayer
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
  );
}
