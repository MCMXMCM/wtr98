import { useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { shuffle } from "../helpers/global";
// import 'react-h5-audio-player/lib/styles.less' Use LESS
// import 'react-h5-audio-player/src/styles.scss' Use SASS

const playlist = [
  { src: "/Christopher Mason - Something Beautiful.mp3" },
  { src: "/Jim Horn - Divided Soul.mp3" },
  { src: "/Ben Sidran - Like Sonny.mp3" },
  { src: "/Bob Thompson - I Just Want You To Be Happy.mp3" },
  { src: "/George Benson And Earl Klugh - Mimosa.mp3" },
  { src: "/Dan Siegel - Celestial Body.mp3" },
  { src: "/George Howard - Broad Street.mp3" },
  { src: "/Birds Of A Feather - Down For The Count.mp3" },
  { src: "/Brian Bromberg - Magic Rain.mp3" },
  { src: "/Bill Shields - Sunset Breeze.mp3" },
  { src: "/Dave Grusin - Welcome To The Road.mp3" },
  { src: "/Dan Siegel - Distant Thoughts.mp3" },
  { src: "/Jim Horn - Neon Nights.mp3" },
  { src: "/George Howard - I Like This Groove.mp3" },
  { src: "/David Sanborn - Lets Just Say Goodbye.mp3" },
  { src: "/Dave Grusin And Lee Ritenour - Early A.M. Attitude.mp3" },
  { src: "/Dave Grusin - Punta Del Soul.mp3" },
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
      <p>
        {" "}
        Now playing:{" "}
        {playlist[currentTrack].src
          .split("")
          .splice(1, playlist[currentTrack].src.length - 5)}
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
        // Try other props!
      />
    </div>
  );
}
