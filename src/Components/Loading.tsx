import clsx from "clsx";
import styled from "styled-components";

interface Props {
  showing: boolean;
}
function Loading({ showing }: Props) {
  console.log(showing);
  return (
    <StyledWrapper className={clsx(showing && "showing")}>
      <img src="/images/wonda.png" alt="" />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
  pointer-events: none;
  opacity: 0;
  background-color: black;
  transition: opacity 1.5s;

  @keyframes spinY {
    from {
      transform: rotateY(0deg);
    }
    to {
      transform: rotateY(360deg);
    }
  }
  img {
    animation: spinY 2s linear infinite;
    max-width: 100%;
  }
  &.showing {
    pointer-events: all;
    opacity: 1;
  }
`;

export default Loading;
