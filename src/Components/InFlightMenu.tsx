import clsx from "clsx";
import styled from "styled-components";

interface Props {
  showing: boolean;
  onClose(): void;
}
function InFlightMenu({ showing, onClose }: Props) {
  return (
    <StyledWrapper className={clsx(showing && "showing")}>
      <h1>In Flight Menu</h1>
      <button onClick={onClose}>close</button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 85vw;
  max-width: 600px;
  right: 0px;
  bottom: 0px;
  height: 80vh;
  background-color: red;
  z-index: 100;
  transform: translateY(100%) translateX(100%);
  transition: transform 500ms;
  box-shadow: -10px 10px 10px rgba(0, 0, 0, 0.5);

  &.showing {
    transform: rotateZ(-10deg);
  }
`;

export default InFlightMenu;
