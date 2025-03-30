import styled from "styled-components";
import { ButtonCallbacks } from "../App";
import { ReactNode, useState } from "react";
import useStore from "../Store/store";

interface Props {
  callbacks: ButtonCallbacks;
  children: ReactNode;
}
function Controls({ callbacks, children }: Props) {
  const [isLookingAtPlane, setIsLookingAtPlane] = useState(true);
  const { setIsPlaying, isPlaying } = useStore();
  const toggleLookingAtPlane = () => {
    const newIsLookingAtPlane = !isLookingAtPlane;
    setIsLookingAtPlane(newIsLookingAtPlane);
    if (newIsLookingAtPlane) {
      callbacks.lookAtPlane();
    } else {
      callbacks.lookAtGlobe();
    }
  };
  return (
    <StyledWrapper>
      <div className="topBar"></div>
      {children}
      <div className="topBar"></div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  .topBar,
  .bottomBar {
    height: 4rem;
  }
`;

export default Controls;
