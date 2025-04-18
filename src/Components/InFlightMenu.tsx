import clsx from "clsx";
import styled from "styled-components";
import useUserStore from "../Store/UserStore";
import { useRef } from "react";
import CopyrightDialog from "./dialogs/CopyrightDialog";
import GoogleAnalyticsManager from "../GoogleAnalyticsManager";

interface Props {
  showing: boolean;
  onClose(): void;
}

interface LinkData {
  label: string;
  href: string;
}
const links: LinkData[] = [
  { label: "test", href: "/" },
  { label: "test", href: "/" },
  { label: "test", href: "/" },
];
function InFlightMenu({ showing, onClose }: Props) {
  const {
    darkMode,
    visualizerOptions,
    setVisualizerOptions,
    isPlaying,
    setIsPlaying,
    airplaneMode,
    setDarkMode,
    setAirplaneMode,
  } = useUserStore();

  const copyrightDialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <CopyrightDialog ref={copyrightDialogRef} />
      <StyledWrapper className={clsx(showing && "showing")}>
        <div className="overlay"></div>
        <div className="headerArea">
          <img src="/images/wishy_logo.png" alt="" />
          <div className="planeImgParent">
            <img src="/images/render.png" alt="" />
          </div>

          <div className="bottomText">
            {!airplaneMode && (
              <p className="airplaneModeText">
                Please turn Airplane Mode back on
              </p>
            )}
          </div>
          <div className="socialsParent"></div>
        </div>
        <div className="side">
          <button onClick={onClose}>
            <img src="/images/closeX.svg" alt="" />
          </button>
          <div>
            <p>Planet Popstar coming out April 25!</p>
          </div>
        </div>
        <div className="iconArea">
          <button
            className={clsx(
              !visualizerOptions.waveformEnabled && "deactivated"
            )}
            onClick={() => {
              GoogleAnalyticsManager.WaveformClicked();
              setVisualizerOptions({
                ...visualizerOptions,
                waveformEnabled: !visualizerOptions.waveformEnabled,
              });
            }}
          >
            <img src="/images/icons/wave.svg" alt="" />
          </button>
          <button
            className={clsx(!visualizerOptions.flower && "deactivated")}
            onClick={() => {
              GoogleAnalyticsManager.FlowerClicked();
              setVisualizerOptions({
                ...visualizerOptions,
                flower: !visualizerOptions.flower,
              });
            }}
          >
            <img src="/images/icons/flower.svg" alt="" />
          </button>
          <button
            className={clsx(!visualizerOptions.wishyMode && "deactivated")}
            onClick={() => {
              GoogleAnalyticsManager.WinspearClicked();
              setVisualizerOptions({
                ...visualizerOptions,
                wishyMode: !visualizerOptions.wishyMode,
              });
            }}
          >
            <img src="/images/icons/winspear.png" alt="" />
          </button>
          <a
            href="https://www.instagram.com/wishy_music_777/?hl=en"
            target="_blank"
          >
            <img src="/images/icons/instagram.svg" />
          </a>
          <button
            onClick={() => {
              GoogleAnalyticsManager.PlayPauseMenuClicked();
              setIsPlaying(!isPlaying);
            }}
          >
            <img
              src={
                isPlaying ? "/images/icons/pause.svg" : "/images/icons/play.svg"
              }
              alt=""
            />
          </button>
          <button
            className="deactivated smoking"
            onClick={() => {
              GoogleAnalyticsManager.SmokingClicked();
            }}
          >
            <img
              src="/images/icons/smoking.svg"
              alt=""
              style={{ transform: "translateY(-5%)" }}
            />
          </button>
          <button
            onClick={() => {
              GoogleAnalyticsManager.AirplaneModeClicked();
              setAirplaneMode(!airplaneMode);
            }}
            className={clsx(!airplaneMode && "deactivated")}
          >
            <img
              src="/images/icons/airplane.svg"
              alt=""
              style={{ transform: "translateX(-5%) translateY(5%)" }}
            />
          </button>
          <button
            onClick={() => {
              GoogleAnalyticsManager.DarkModeClicked();
              setDarkMode(!darkMode);
            }}
            className={clsx(!airplaneMode && "deactivated")}
          >
            <img
              src={
                darkMode
                  ? "/images/icons/lightModeSun.svg"
                  : "/images/icons/darkModeMoon.svg"
              }
              alt=""
            />
          </button>
        </div>
        <div className="buttonArea">
          <a href="https://lnk.to/planet-popstar/winspear" target="_blank">
            <p>Merch</p>
          </a>
          <a href="https://www.wishyband.com/shows" target="_blank">
            <p>Tour</p>
          </a>
          <a href="https://lnk.to/planet-popstar" target="_blank">
            <p>Music</p>
          </a>
          <a
            href="https://www.youtube.com/watch?v=UbwUwiReGJ4&list=OLAK5uy_lX82q757nbYUKlA4bNoACMw8IG_gsjXIo"
            target="_blank"
          >
            <p>Watch</p>
          </a>
        </div>

        <div className="creditsArea">
          <a href="/credits" target="blank">
            credits
          </a>
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              copyrightDialogRef.current!.showModal();
            }}
          >
            copyright
          </a>
        </div>
      </StyledWrapper>
    </>
  );
}

const StyledWrapper = styled.div`
  position: absolute;
  display: grid;
  grid-template-columns: repeat(6, 1fr) 60px;
  grid-template-rows: repeat(11, 1fr) 50px;
  font-family: Verdana;
  row-gap: 10px;
  background-color: beige;
  color: #3d5891;
  width: 85vw;
  max-width: 500px;
  right: 0px;
  bottom: 0px;
  height: 90%;
  max-height: 90%;
  z-index: 100;
  transform: translateY(100%) translateX(100%);
  transition: transform 500ms;
  box-shadow: -10px 10px 10px rgba(0, 0, 0, 0.5);
  /* border-radius: 20px; */
  > div {
    padding: 10px;
  }
  .overlay {
    position: absolute;
    padding: 0px;
    width: 100%;
    height: 100%;
    background-image: url("/images/beige-paper.png");
    /* background-repeat: repeat; */
    /* background-size: 200px; */
    pointer-events: none;
    mix-blend-mode: overlay;
    /* filter: contrast(5); */
    z-index: 2;
  }
  &.showing {
    transform: translateX(-20px) rotateZ(-5deg);
  }
  .side {
    grid-row: -1 / 1;
    grid-column: -2/ -1;
    color: black;
    display: flex;
    flex-direction: column;
    padding: 2px;
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 100%;
      aspect-ratio: 1;
      border-radius: 999px;
      border: 5px solid white;
      background-color: transparent;
      img {
        width: 80%;
      }
    }
    div {
      flex: 1;
      display: flex;
      writing-mode: vertical-rl;
      align-items: center;
      p {
        color: beige;
        font-size: 1.5rem;
        margin: 0;
        margin-top: 20px;
      }
    }
    background-color: #e5c653;
  }

  .headerArea {
    grid-row: 1 / span 4;
    grid-column: 1 / -2; /* Span all columns */
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    grid-template-columns: 1fr;
    background-color: #5ecca7;
    position: relative;
    .socialsParent {
      grid-row: 4 / 5;
      grid-column: 1 / -2; /* Span all columns */
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
      z-index: 100;
      a {
        right: 0px;
        transition: transform 100ms;
        height: 100%;
        @media (hover: hover) and (pointer: fine) {
          &:hover {
            transform: scale(1.1) rotate(5deg);
          }
        }
      }
      img {
        width: 80px;
        @media (max-width: 768px) {
          width: 50px;
        }

        /* transform: translateY(5%); */
        filter: brightness(0) saturate(100%) invert(96%) sepia(42%)
          saturate(221%) hue-rotate(2deg) brightness(105%) contrast(92%);
      }
    }
    .planeImgParent {
      grid-row: 3 / 4;
      position: relative;
      width: 110%;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        position: absolute;
        width: 100%;
      }
    }
    @keyframes pulseError {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    .airplaneModeText {
      font-weight: bold;
      font-size: 1.2rem;
      color: red;
      animation: pulseError 1s ease-in-out infinite;
    }
    h1 {
      z-index: 1;
      grid-row: 2/ 3;
      margin: 0;
      font-size: 1.8rem;
      text-shadow: 0 0 5px white;
    }
    p {
      margin: 0;
    }
    img {
      width: 100%;
      height: auto;
      object-fit: contain;
      pointer-events: none;
    }

    .bottomText {
      grid-row: -1 / -2;
      text-align: right;
      z-index: 10;
    }
  }

  .iconArea {
    grid-row: 5 / 8;
    grid-column: 1 / -2;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    justify-items: center;
    gap: 10px;
    button,
    a {
      height: 100%;
      max-width: 100%;
      overflow: hidden;
      aspect-ratio: 1;
      border-radius: 999px;
      box-sizing: border-box;
      border: 5px solid green;
      background-color: transparent;
      color: inherit;
      cursor: help;
      &.smoking {
        cursor: not-allowed;
      }

      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      touch-action: manipulation;
      img {
        pointer-events: none;
        height: 80%;
        filter: brightness(0) saturate(100%);
      }

      &:active {
        background-color: burlywood;
        transform: scale(0.97);
      }
      @media (hover: hover) and (pointer: fine) {
        & {
          transition: transform 100ms;
          &:hover {
            transform: scale(1.1);
          }
        }
      }
      &.deactivated {
        border-color: red;
        position: relative;
      }
      &.deactivated::after {
        content: ""; /* Required for pseudo-elements */
        position: absolute;
        background-color: red;
        top: 50%;
        left: 0;
        margin: auto;
        transform: translateY(-50%) rotate(-45deg);
        width: 105%;
        height: 5px; /* Thickness of the line */
        transform-origin: center;
      }
    }
  }
  .buttonArea {
    grid-row: 8 / 12;
    grid-column: 1 / -2;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    border: 4px solid #5ecca7;
    border-radius: 10px;
    margin: 0px 10px;
    font-size: 1.2rem;
    a {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      font-weight: bold;
      /* flex-direction: column; */
      padding: 10px;
      border: 5px solid beige;
      background-color: #5ecca7;
      border-radius: 20px;
      transition: transform 200ms;
      color: beige;
      font-family: inherit;
      p {
        margin: 0;
      }
      img {
        /* height: 10px; */
        width: 50%;
        object-fit: contain;
      }
      @media (hover: hover) and (pointer: fine) {
        &:hover {
          z-index: 1;
          transform: scale(1.1) rotate(5deg);
        }
      }
    }
  }

  .creditsArea {
    display: flex;
    justify-content: space-between;
    grid-row: -2/ -1;
    grid-column: -2 / 1;
  }
`;

export default InFlightMenu;
