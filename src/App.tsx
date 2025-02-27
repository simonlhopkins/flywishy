import { useEffect, useRef } from "react";
import "./App.css";
import MainScene from "./ThreeJS/MainScene";

function App() {
  const sceneRef = useRef<MainScene>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (sceneRef.current == null) {
      sceneRef.current = new MainScene(videoRef.current!);
    }
  }, []);
  return (
    <>
      <video hidden ref={videoRef} src="./video/flyVideo.mp4"></video>
      <div
        style={{
          position: "absolute",
          left: "0px",
          top: "0px",
          padding: "1rem",
        }}
      >
        <h1>fly - wishy!!</h1>
        <button
          className="retro-button"
          onClick={() => {
            videoRef.current!.play();
          }}
        >
          play
        </button>
        <button
          className="retro-button"
          onClick={() => {
            videoRef.current!.pause();
          }}
        >
          pause
        </button>
        <button
          className="retro-button"
          onClick={() => {
            sceneRef.current!.reset();
            videoRef.current!.currentTime = 0;
            videoRef.current!.play();
          }}
        >
          reset
        </button>
      </div>
      <div id="flyWishy"></div>
    </>
  );
}

export default App;
