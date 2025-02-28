import { useEffect, useRef } from "react";
import "./App.css";
import MainScene from "./ThreeJS/MainScene";
import Menu from "./Components/Menu";
import MusicControls from "./Components/MusicControls";
import { Util } from "./Util";

export interface MenuCallbacks {
  play(): void;
  pause(): void;
  upateVideoSource(newSource: string): void;
  reset(): void;
  lookAtGlobe(): void;
  lookAtPlane(): void;
}
function App() {
  const sceneRef = useRef<MainScene>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (sceneRef.current == null) {
      sceneRef.current = new MainScene(videoRef.current!);
    }
  }, []);
  const callbacks: MenuCallbacks = {
    play() {
      videoRef.current!.play();
    },
    pause() {
      videoRef.current!.pause();
    },
    upateVideoSource(newSource: string) {
      const video = videoRef.current;
      if (video) {
        video.src = newSource;
        sceneRef.current!.reset();
        videoRef.current!.currentTime = 0;
      }
    },
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
  return (
    <>
      <video
        preload="metadata"
        autoPlay={false}
        hidden
        playsInline
        ref={videoRef}
        src="./video/flyVideoSmall.mp4"
      ></video>
      <Menu callbacks={callbacks} />
      <MusicControls getVideoElement={() => videoRef.current} />
      <div id="flyWishy"></div>
    </>
  );
}

export default App;
