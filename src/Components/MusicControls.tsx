import { useEffect, useRef, useState } from "react";
import { ButtonCallbacks } from "../App";
import styled from "styled-components";
import useStore from "../Store/store";

interface Props {}
function MusicControls() {
  const [sliderValue, setSliderValue] = useState(0);
  const { setIsPlaying, isPlaying } = useStore();

  // Sync slider with video time

  return (
    <StyledWrapper>
      <button
        onClick={() => {
          setIsPlaying(!isPlaying);
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
