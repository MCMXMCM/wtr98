import { useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
// import 'react-h5-audio-player/lib/styles.less' Use LESS
// import 'react-h5-audio-player/src/styles.scss' Use SASS

const playlist = [
  { src: "/Birds Of A Feather - Down For The Count.mp3" },
  { src: "/Brian Bromberg - Magic Rain.mp3" },
  { src: "/Bill Shields - Sunset Breeze.mp3" },
];

export default function Player() {
  const [currentTrack, setTrackIndex] = useState(0);
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
      <p> Now playing: {playlist[currentTrack].src.split("").splice(1)}</p>
      <AudioPlayer
        customVolumeControls={[]}
        showJumpControls={false}
        src={playlist[currentTrack].src}
        showSkipControls
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
