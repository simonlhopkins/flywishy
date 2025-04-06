import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

interface SongData {
  name: string;
  startTime: number;
}

const SongDatas: SongData[] = [
  {
    name: "fly",
    startTime: 0,
  },
  { name: "planet popstar", startTime: 190 },
  { name: "over and over", startTime: 435 },
  { name: "chaser", startTime: 673 },
  { name: "portal", startTime: 896 },
  { name: "slide", startTime: 1114 },
];
function NowPlaying() {
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);

  useEffect(() => {
    const audio = document.getElementById("wishyAudio") as HTMLAudioElement;
    if (!audio) return;

    const updateCurrentSong = () => {
      const currentTime = audio.currentTime;
      // Find the latest song whose startTime is <= currentTime
      const activeSong =
        [...SongDatas]
          .reverse()
          .find((song) => currentTime >= song.startTime) ?? SongDatas[0];

      setCurrentSong((prev) =>
        prev?.name !== activeSong.name ? activeSong : prev
      );
    };

    audio.addEventListener("timeupdate", updateCurrentSong);
    updateCurrentSong(); // run immediately too

    return () => {
      audio.removeEventListener("timeupdate", updateCurrentSong);
    };
  }, []);

  return (
    <StyledWrapper>
      {new Array(20).fill("").map((_, i) => (
        <p key={i} className="ios-text">
          NOW PLAYING {currentSong ? currentSong.name.toUpperCase() : "..."}
        </p>
      ))}
    </StyledWrapper>
  );
}
const scroll = keyframes`
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
`;
const StyledWrapper = styled.div`
  display: inline-flex;
  overflow: visible;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  z-index: 100;
  p {
    animation: ${scroll} 5s linear infinite;
    margin: 0;
    padding: 10px;
    text-wrap: nowrap;
  }
`;

export default NowPlaying;
