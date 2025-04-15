import { useCallback, useEffect, useRef, useState } from "react";
import MainScene from "../ThreeJS/MainScene";
import styled from "styled-components";
import clsx from "clsx";
import Events from "../Events";
import CheatDialog from "./dialogs/CheatDialog";
import useUserStore from "../Store/UserStore";
import IntroDialog from "./dialogs/IntroDialog";
import InFlightMenu from "./InFlightMenu";
import EmailEntryDialog from "./dialogs/EmailEntryDialog";
import NowPlaying from "./NowPlaying";

const cheatCodes = ["WISHYCOFFEEHOUSE1", "ERIC", "2208"];

export interface ButtonCallbacks {
  reset(): void;
  lookAtGlobe(): void;
  lookAtPlane(): void;
}
function Visualizer() {
  const sceneRef = useRef<MainScene>(null);
  const iframeParentRef = useRef<HTMLDivElement>(null);
  const cheatDialogRef = useRef<HTMLDialogElement>(null);
  const introDialogRef = useRef<HTMLDialogElement>(null);
  const emailDialogRef = useRef<HTMLDialogElement>(null);

  const [isPlaneView, setIsPlaneView] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [disableInput, setDisableInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    hasSeenIntro,
    visualizerOptions,
    isPlaying,
    darkMode,
    user,
    setDarkMode,
    setIsPlaying,
  } = useUserStore();
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  useEffect(() => {
    if (!hasSeenIntro && user) {
      introDialogRef.current!.showModal();
    }
    if (user == null) {
      emailDialogRef.current!.showModal();
    }
  }, [hasSeenIntro, user]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current!.updateVisualizerOptions(visualizerOptions);
    }
  }, [visualizerOptions]);

  // useEffect(() => {
  //   if (sceneRef.current) {
  //     sceneRef.current!.updateVisualizerOptions(visualizerOptions);
  //   }
  // }, [darkMode]);

  useEffect(() => {
    if (sceneRef.current == null) {
      setDisableInput(true);
      setLoading(true);
      sceneRef.current = new MainScene(
        document.getElementById("wishyAudio") as HTMLAudioElement,
        iframeParentRef.current!,
        {
          OnCityUpdate: () => {},
        },
        () => {
          setLoading(false);
          setDisableInput(false);
        }
      );
      document.addEventListener("visibilitychange", (event) => {
        if (document.hidden) {
          // do something if the page visibility changes to hidden
          setIsPlaying(false);
        } else {
          // do something if the page visibility changes to visible
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      sceneRef.current!.play();
    } else {
      sceneRef.current!.pause();
    }
  }, [isPlaying]);

  const onCheatSubmitted = (cheatText: string) => {
    const parsedCode = cheatText.replaceAll(" ", "").toUpperCase();
    console.log(parsedCode);

    if (cheatCodes.includes(parsedCode)) {
      console.log("success");
    } else {
      console.log("cheat code not found.");
    }
  };
  let musicSrc =
    "https://d1d621jepmseha.cloudfront.net/WishyPlanetPopstarStream.mp3";
  musicSrc = "/video/monaLisa.mp4";
  return (
    <StyledWrapper>
      <EmailEntryDialog ref={emailDialogRef} />
      <CheatDialog ref={cheatDialogRef} onCheatSubmitted={onCheatSubmitted} />
      <IntroDialog
        ref={introDialogRef}
        onPlay={() => {
          setIsPlaying(true);
        }}
      />
      <InFlightMenu showing={showMenu} onClose={() => setShowMenu(false)} />
      <video
        style={{ width: "100%" }}
        id="wishyAudio"
        hidden
        controls
        crossOrigin="anonymous"
        preload="metadata"
        loop
        src={musicSrc}
      ></video>
      {/* <div className={clsx("topBar", "ios-navigationBar")}>
        <h1 className={clsx("ios-text")}>PDX to HND</h1>
        <button
          onClick={() => {
            cheatDialogRef.current!.showModal();
          }}
          className={clsx("ios-button", "viewButton")}
        >
          <p className={clsx("ios-text")}>Cheat</p>
        </button>
      </div> */}
      <NowPlaying />
      {loading && <div className="loading">loading...</div>}
      <div id="flyWishy" hidden={loading}>
        <img
          className="backgroundImg"
          style={{ display: darkMode ? "block" : "none" }}
          src="/images/nightsky2.gif"
        />
        <div
          id="iframe-parent"
          style={{ display: !darkMode ? "block" : "none" }}
        >
          <div id="iframe" ref={iframeParentRef}></div>
        </div>
      </div>
      <div className={clsx("bottomBar", "ios-navigationBar")}>
        {/* <button
          onClick={() => {
            toggleFullScreen();
          }}
          className={clsx("ios-button")}
        >
          <img src="/images/open-parachute.svg" />
        </button> */}
        <button
          disabled={disableInput}
          onClick={() => {
            setShowMenu((prev) => !prev);
          }}
          className={clsx("ios-button", "viewButton")}
        >
          <p className={clsx("ios-text")}>Menu</p>
        </button>
        <div className="ios-segmentedControl">
          <button
            disabled={disableInput}
            onClick={() => {
              setIsPlaneView(true);
              setDisableInput(true);
              sceneRef.current!.lookAtPlane().then(() => {
                setDisableInput(false);
              });
            }}
            className={clsx("ios-button", !isPlaneView && "inactive")}
          >
            <p className={clsx("ios-text")}>Fly</p>
          </button>
          <button
            disabled={disableInput}
            onClick={() => {
              setIsPlaneView(false);
              setDisableInput(true);
              sceneRef.current!.lookAtGlobe().then(() => {
                setDisableInput(false);
              });
            }}
            className={clsx("ios-button", isPlaneView && "inactive")}
          >
            <p className={clsx("ios-text")}>Planet</p>
          </button>
        </div>
        <div className="rightButtonParent">
          <button
            disabled={disableInput}
            onClick={() => {
              setDarkMode(!darkMode);
            }}
            className={clsx("ios-button", "viewButton")}
          >
            <img
              src={
                darkMode
                  ? "/images/icons/lightModeSun.svg"
                  : "/images/icons/darkModeMoon.svg"
              }
            ></img>
          </button>
          <button
            disabled={disableInput}
            onClick={() => {
              setIsPlaying(!isPlaying);
            }}
            className={clsx("ios-button", "viewButton")}
          >
            <img
              src={
                isPlaying
                  ? "/images/icons/ios-pause.svg"
                  : "/images/icons/ios-play.svg"
              }
            ></img>
          </button>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;

  .backgroundImg {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  .ios-modal .buttonContainer {
    display: inline-flex;
    width: 100%;
    gap: 10px;
    button {
      flex: 1;
    }
  }

  button img {
    color: white;
    filter: invert(100%) sepia(0%) saturate(12%) hue-rotate(226deg)
      brightness(100%) contrast(100%);
  }
  .pausedParent {
    position: absolute;
    left: 0px;
    height: 0px;
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
  }
  #iframe-parent {
    position: absolute;
    z-index: -10;
    overflow: hidden;
    height: 100%;
    width: 100%;
    display: flex;
    display: none;

    align-items: center;
    justify-content: center;
    background-color: black;
    iframe {
      width: 100%;
      height: 100%;
      transform: scale(1.4);
    }
    @media (max-width: 768px) {
      iframe {
        transform: scale(3.5); /* Adjust scaling for mobile */
      }
    }
  }
  #flyWishy {
    position: relative;
    flex: 1;
    overflow: hidden;
    /* background-image: url("/images/your_name_clouds.jpg"); */
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    canvas {
      cursor: grab;
    }
    canvas.-dragging {
      cursor: grabbing;
    }
    canvas.-moving {
      cursor: move;
    }
  }
  .topBar,
  .bottomBar {
    gap: 5px;
    display: flex;
    align-items: center;
    z-index: 50;
    height: 74px;
    padding: 10px;
    box-sizing: border-box;
    justify-content: space-between;
    .rightButtonParent {
      display: flex;
      gap: inherit;
    }
  }
  .viewButton {
    font-size: 2rem;
  }
`;

export default Visualizer;
