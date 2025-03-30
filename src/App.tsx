import { useEffect, useRef, useState } from "react";
import "./App.css";
import MainScene from "./ThreeJS/MainScene";
import useStore from "./Store/store";
import styled from "styled-components";
import clsx from "clsx";

const cheatCodes = ["WISHYCOFFEEHOUSE1", "ERIC", "2208"];

export interface ButtonCallbacks {
  reset(): void;
  lookAtGlobe(): void;
  lookAtPlane(): void;
}
function App() {
  const sceneRef = useRef<MainScene>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeParentRef = useRef<HTMLDivElement>(null);
  const cheatDialogRef = useRef<HTMLDialogElement>(null);
  const [cheatCodeText, setCheatCodeText] = useState("");
  const [isPlaneView, setIsPlaneView] = useState(true);
  const [disableInput, setDisableInput] = useState(false);

  const { setIsPlaying, isPlaying } = useStore();
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  useEffect(() => {
    if (sceneRef.current == null) {
      setDisableInput(true);
      sceneRef.current = new MainScene(
        videoRef.current!,
        iframeParentRef.current!,
        () => {
          setDisableInput(false);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      sceneRef.current!.play();
    } else {
      sceneRef.current!.pause();
    }
  }, [isPlaying]);

  const callbacks: ButtonCallbacks = {
    reset() {
      sceneRef.current!.reset();
      videoRef.current!.currentTime = 0;
      videoRef.current!.play();
    },
    lookAtGlobe() {
      sceneRef.current!.lookAtGlobe();
    },
    lookAtPlane() {
      sceneRef.current!.lookAtPlane();
    },
  };

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
      <dialog className={clsx("ios-modal")} ref={cheatDialogRef}>
        <img className={clsx("gloss")} src="/images/Gloss.svg" alt="" />
        <h1 className={clsx("ios-text")}>Cheat Code</h1>
        <p style={{ marginBottom: "10px" }} className={clsx("ios-text")}>
          Hint: Look at the side of the plane
        </p>
        <input
          autoFocus
          onChange={(e: any) => setCheatCodeText(e.target.value)}
          value={cheatCodeText}
          placeholder="Enter a cheat code..."
          type="text"
        />
        <div style={{ marginTop: "10px" }} className="buttonContainer">
          <button
            onClick={() => {
              cheatDialogRef.current!.close();
            }}
            className="ios-button"
          >
            <p className={clsx("ios-text")}>Close</p>
          </button>
          <button
            onClick={() => {
              onCheatSubmitted(cheatCodeText);
              setCheatCodeText("");
              cheatDialogRef.current!.close();
            }}
            disabled={cheatCodeText == ""}
            className={clsx("ios-button", "primary")}
          >
            <p className={clsx("ios-text")}>Submit</p>
          </button>
        </div>
      </dialog>
      <video
        preload="metadata"
        autoPlay={false}
        // hidden
        src="/video/flyVideo.mp4"
        controls
        playsInline
        loop={true}
        ref={videoRef}
      ></video>

      <div className={clsx("topBar", "ios-navigationBar")}>
        <button className={clsx("ios-button", "viewButton")}>
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
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .ios-modal .buttonContainer {
    display: inline-flex;
    width: 100%;
    gap: 10px;
    button {
      flex: 1;
    }
  }
  button p {
    margin: 0px;
    font-weight: bold;
    font-size: 1.5rem;
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
    z-index: 999;
    height: 74px;
    padding: 10px;
    box-sizing: border-box;
    justify-content: space-between;
  }
  .viewButton {
    font-size: 2rem;
  }
`;

export default App;
