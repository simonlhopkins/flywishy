import { CityData } from "@/sharedTypes/CityData";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import Events from "../Events";

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

interface JourneyInfo {
  fromCity: CityData;
  toCity: CityData;
}
function NowPlaying() {
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);
  const [journeyInfo, setJourneyInfo] = useState<JourneyInfo | null>(null);

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

    function onCityChanged(
      e: CustomEvent<{
        fromCity: CityData;
        toCity: CityData;
      }>
    ) {
      setJourneyInfo({
        fromCity: e.detail.fromCity,
        toCity: e.detail.toCity,
      });
    }
    Events.Get().addEventListener("cityChanged", onCityChanged);

    return () => {
      audio.removeEventListener("timeupdate", updateCurrentSong);
      Events.Get().removeEventListener("cityChanged", onCityChanged);
    };
  }, []);

  function journeyInfoToString(journeyInfo: JourneyInfo) {
    return `${journeyInfo.fromCity.city} ➡️ ${journeyInfo.toCity.city}`;
  }
  return (
    <StyledWrapper>
      {new Array(10).fill("").map((_, i) => (
        <div className="contentWrapper" key={i}>
          <p className="ios-text">
            NOW PLAYING {currentSong ? currentSong.name.toUpperCase() : "..."}
          </p>
          <p className="ios-text journeyText">
            {journeyInfo && journeyInfoToString(journeyInfo).toUpperCase()}
          </p>
        </div>
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
  .contentWrapper {
    gap: 10px;
    display: inline-flex;
    animation: ${scroll} 5s linear infinite;
    margin: 0;
    padding: 0 10px;
    text-wrap: nowrap;
    box-sizing: border-box;
    text-align: center;
    p {
      overflow: hidden;
    }
  }
  .journeyText {
    width: 24rem;
  }
`;

export default NowPlaying;
