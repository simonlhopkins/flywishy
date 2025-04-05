import clsx from "clsx";
import styled from "styled-components";
import useUserStore from "../Store/UserStore";

interface Props {
  showing: boolean;
  onClose(): void;
}

interface LinkData {
  label: string;
  href: string;
}
const links: LinkData[] = [
  { label: "test", href: "/" },
  { label: "test", href: "/" },
  { label: "test", href: "/" },
];
function InFlightMenu({ showing, onClose }: Props) {
  const { visualizerOptions, setVisualizerOptions, isPlaying, setIsPlaying } =
    useUserStore();

  return (
    <StyledWrapper className={clsx(showing && "showing")}>
      <div className="overlay"></div>
      <div className="headerArea">
        <img src="/images/wishy_logo.png" alt="" />
        <h1>Planet Popstar</h1>
        <div className="bottomText">
          <p>In Flight Menu</p>
          {!visualizerOptions.airplaneMode && (
            <p>Please turn Airplane Mode back on</p>
          )}
        </div>
      </div>
      <div className="side">
        <button onClick={onClose}>
          <img src="/images/closeX.svg" alt="" />
        </button>
        <div>
          <p>hello</p>
        </div>
      </div>
      <div className="iconArea">
        <button
          className={clsx(!visualizerOptions.waveformEnabled && "deactivated")}
          onClick={() => {
            setVisualizerOptions({
              ...visualizerOptions,
              waveformEnabled: !visualizerOptions.waveformEnabled,
            });
          }}
        >
          <img src="/images/icons/wave.svg" alt="" />
        </button>
        <button
          className={clsx(!visualizerOptions.flower && "deactivated")}
          onClick={() => {
            setVisualizerOptions({
              ...visualizerOptions,
              flower: !visualizerOptions.flower,
            });
          }}
        >
          <img src="/images/icons/flower.svg" alt="" />
        </button>
        <button
          className={clsx(!visualizerOptions.wishyMode && "deactivated")}
          onClick={() => {
            setVisualizerOptions({
              ...visualizerOptions,
              wishyMode: !visualizerOptions.wishyMode,
            });
          }}
        >
          <img src="/images/icons/winspear.png" alt="" />
        </button>
        <button
          onClick={() => {
            setIsPlaying(!isPlaying);
          }}
        >
          <img
            src={
              isPlaying ? "/images/icons/pause.svg" : "/images/icons/play.svg"
            }
            alt=""
          />
        </button>
        <button className="deactivated">
          <img src="/images/icons/smoking.svg" alt="" />
        </button>
        <button
          onClick={() => {
            setVisualizerOptions({
              ...visualizerOptions,
              airplaneMode: !visualizerOptions.airplaneMode,
            });
          }}
          className={clsx(!visualizerOptions.airplaneMode && "deactivated")}
        >
          <img src="/images/icons/airplane.svg" alt="" />
        </button>
      </div>
      <div className="buttonArea">
        <a href="https://winspear.biz/store/wishy" target="_blank">
          <p>Merch</p>
        </a>
        <a
          href="https://winspear.biz/wishy#:~:text=in%20high%20school.%22-,TOUR%20DATES,-MAY%209"
          target="_blank"
        >
          <p>Tour Dates</p>
        </a>
        <a href="https://wishy.bandcamp.com/" target="_blank">
          <p>Music</p>
        </a>
        <a href="/">
          <p>More</p>
        </a>
      </div>

      <div className="creditsArea">
        <a href="">credits</a>
        <a href="">copywrite</a>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: absolute;
  display: grid;
  grid-template-columns: repeat(6, 1fr) 50px;
  grid-template-rows: repeat(11, 1fr) 50px;
  font-family: Verdana;
  row-gap: 10px;
  background-color: beige;
  color: #3d5891;
  width: 85vw;
  max-width: 500px;
  right: 0px;
  bottom: 0px;
  height: 90%;
  max-height: 90%;
  z-index: 100;
  transform: translateY(100%) translateX(100%);
  transition: transform 500ms;
  box-shadow: -10px 10px 10px rgba(0, 0, 0, 0.5);
  /* border-radius: 20px; */
  > div {
    padding: 10px;
  }
  .overlay {
    position: absolute;
    padding: 0px;
    width: 100%;
    height: 100%;
    background-image: url("/images/beige-paper.png");
    /* background-repeat: repeat; */
    /* background-size: 200px; */
    pointer-events: none;
    mix-blend-mode: overlay;
    /* filter: contrast(5); */
    z-index: 2;
  }
  &.showing {
    transform: translateX(-20px) rotateZ(-5deg);
  }
  .side {
    grid-row: -1 / 1;
    grid-column: -2/ -1;
    color: black;
    display: flex;
    flex-direction: column;
    padding: 2px;
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 100%;
      aspect-ratio: 1;
      border-radius: 999px;
      border: 5px solid white;
      background-color: transparent;
      img {
        width: 80%;
      }
    }
    > div {
      flex: 1;
      writing-mode: sideways-lr;
    }
    background-color: #e5c653;
  }

  .headerArea {
    grid-row: 1 / span 4;
    grid-column: 1 / -2; /* Span all columns */
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    grid-template-columns: 1fr;
    background-color: #5ecca7;
    h1 {
      margin: 0;
    }
    p {
      margin: 0;
    }
    img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }

    .bottomText {
      grid-row: -1 / -2;
      text-align: right;
    }
  }
  .iconArea {
    grid-row: 5 / 8;
    grid-column: 1 / -2;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    justify-items: center;
    button {
      width: 80px;
      aspect-ratio: 1;
      border-radius: 999px;
      border: 5px solid green;
      background-color: transparent;
      color: inherit;
      cursor: help;
      transition: transform 200ms;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      touch-action: manipulation;
      img {
        width: 80%;
        filter: invert(0%) sepia(96%) saturate(7476%) hue-rotate(44deg)
          brightness(92%) contrast(98%);
      }
      &:hover {
        transform: scale(1.1);
      }
      &:active {
        background-color: burlywood;
        transform: scale(0.97);
      }
      &.deactivated {
        border-color: red;
        position: relative;
      }
      &.deactivated::after {
        content: ""; /* Required for pseudo-elements */
        position: absolute;
        background-color: red;
        top: 50%;
        left: 0;
        margin: auto;
        transform: translateY(-50%) rotate(-45deg);
        width: 105%;
        height: 5px; /* Thickness of the line */
        transform-origin: center;
      }
    }
  }
  .buttonArea {
    grid-row: 8 / 12;
    grid-column: 1 / -2;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    border: 4px solid #5ecca7;
    border-radius: 10px;
    margin: 0px 10px;
    a {
      display: flex;
      align-items: center;
      justify-content: center;
      /* flex-direction: column; */
      padding: 10px;
      border: 5px solid beige;
      background-color: #5ecca7;
      border-radius: 20px;
      transition: transform 200ms;
      color: beige;
      font-family: inherit;
      font-size: 1.5rem;

      img {
        /* height: 10px; */
        width: 50%;
        object-fit: contain;
      }
      &:hover {
        z-index: 1;
        transform: scale(1.1) rotate(5deg);
      }
    }
  }

  .creditsArea {
    display: flex;
    justify-content: space-between;
    grid-row: -2/ -1;
    grid-column: -2 / 1;
  }
`;

export default InFlightMenu;
