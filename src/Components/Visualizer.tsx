import { useCallback, useEffect, useRef, useState } from "react";
import MainScene from "../ThreeJS/MainScene";
import styled from "styled-components";
import clsx from "clsx";
import Events from "../Events";
import CheatDialog from "./dialogs/CheatDialog";
import useUserStore from "../Store/UserStore";
import IntroDialog from "./dialogs/IntroDialog";
import InFlightMenu from "./InFlightMenu";

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

  const [isPlaneView, setIsPlaneView] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const [disableInput, setDisableInput] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { hasSeenIntro } = useUserStore();
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  useEffect(() => {
    if (!hasSeenIntro) {
      introDialogRef.current!.showModal();
    }
  }, [hasSeenIntro]);
  useEffect(() => {
    if (sceneRef.current == null) {
      setDisableInput(true);
      sceneRef.current = new MainScene(
        document.getElementById("wishyAudio") as HTMLAudioElement,
        iframeParentRef.current!,
        {
          OnCityUpdate: () => {},
        },
        () => {
          setDisableInput(false);
        }
      );

      Events.Get().addEventListener("cityChanged", (e) => {
        console.log(e.detail.fromCity, e.detail.toCity);
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
  return (
    <StyledWrapper>
      <CheatDialog ref={cheatDialogRef} onCheatSubmitted={onCheatSubmitted} />
      <IntroDialog
        ref={introDialogRef}
        onPlay={() => {
          sceneRef.current!.play();
        }}
      />
      <InFlightMenu showing={showMenu} onClose={() => setShowMenu(false)} />
      <audio
        id="wishyAudio"
        // hidden
        controls
        crossOrigin="anonymous"
        preload="metadata"
        loop
        src="https://d1d621jepmseha.cloudfront.net/Wishy+-+Planet+Popstar+(Official+EP+Stream)+%5BuKu6TFNjkNc%5D.mp3"
      ></audio>
      <div className={clsx("topBar", "ios-navigationBar")}>
        <button
          onClick={() => {
            setShowMenu((prev) => !prev);
          }}
          className={clsx("ios-button", "viewButton")}
        >
          <p className={clsx("ios-text")}>Menu</p>
        </button>
        <h1 className={clsx("ios-text")}>PDX to HND</h1>
        <button
          onClick={() => {
            cheatDialogRef.current!.showModal();
          }}
          className={clsx("ios-button", "viewButton")}
        >
          <p className={clsx("ios-text")}>Cheat</p>
        </button>
      </div>
      <div id="flyWishy">
        <div id="iframe-parent">
          <div id="iframe" ref={iframeParentRef}></div>
        </div>
      </div>
      <div className={clsx("bottomBar", "ios-navigationBar")}>
        <button
          onClick={() => {
            toggleFullScreen();
          }}
          className={clsx("ios-button")}
        >
          <img src="/images/open-parachute.svg" />
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
            <p className={clsx("ios-text")}>Plane</p>
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
            <p className={clsx("ios-text")}>World</p>
          </button>
        </div>
        <button
          onClick={() => {
            setIsPlaying(!isPlaying);
          }}
          className={clsx("ios-button", "viewButton")}
        >
          <img
            src={isPlaying ? "/images/ios-pause.svg" : "/images/ios-play.svg"}
          ></img>
        </button>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
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
  #iframe-parent {
    position: absolute;
    z-index: -10;
    overflow: hidden;
    height: 100%;
    width: 100%;
    display: flex;
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
  }

  .topBar,
  .bottomBar {
    display: flex;
    align-items: center;
    z-index: 50;
    height: 74px;
    padding: 10px;
    box-sizing: border-box;
    justify-content: space-between;
  }
  .viewButton {
    font-size: 2rem;
  }
`;

export default Visualizer;
