import { useEffect, useRef, useState } from "react";
import { MenuCallbacks } from "../App";
import styled from "styled-components";

interface Props {
  getVideoElement(): HTMLVideoElement | null;
}
function MusicControls({ getVideoElement }: Props) {
  const [sliderValue, setSliderValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // Sync slider with video time
  const handleVideoTimeUpdate = () => {
    const video = getVideoElement();

    if (video) {
      if (Number.isFinite(video.duration)) {
        const value = (video.currentTime / video.duration) * 100;
        setSliderValue(value);
      } else {
        setSliderValue(0);
      }
    }
  };

  // Update video time when slider value changes
  const handleSliderChange = (event: any) => {
    const videoElement = getVideoElement();
    getVideoElement()!.pause();
    setIsPlaying(false);
    if (videoElement) {
      console.log(videoElement.duration);
      const newTime = (event.target.value / 100) * videoElement.duration;
      videoElement.currentTime = newTime;
    }
  };

  useEffect(() => {
    // Add event listener to sync slider with video time
    const videoElement = getVideoElement();
    if (videoElement) {
      videoElement.addEventListener("timeupdate", handleVideoTimeUpdate);
    }

    // Cleanup event listener on component unmount
    return () => {
      if (videoElement) {
        videoElement.removeEventListener("timeupdate", handleVideoTimeUpdate);
      }
    };
  }, []);
  return (
    <StyledWrapper>
      <input
        onChange={handleSliderChange}
        type="range"
        value={sliderValue}
        min="0"
        max="100"
      />
      <button
        onClick={() => {
          setIsPlaying((prev) => {
            const newIsPlaying = !prev;
            if (newIsPlaying) {
              getVideoElement()!.play();
            } else {
              getVideoElement()!.pause();
            }
            return newIsPlaying;
          });
        }}
      >
        {isPlaying ? "pause" : "play"}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: absolute;
  display: flex;
  bottom: 30px;
  left: 0px;
  right: 0px;
  margin: auto;
  flex-direction: column;
  gap: 0px;
  align-items: center;
  justify-content: center;
  button {
    width: 5rem;
    aspect-ratio: 1;
    border-radius: 999px;
  }
  input {
    width: 100%;
    max-width: 400px;
  }
`;

export default MusicControls;
