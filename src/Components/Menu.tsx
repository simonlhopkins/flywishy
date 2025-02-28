import clsx from "clsx";
import { useState } from "react";
import styled from "styled-components";
import { MenuCallbacks } from "../App";

interface Props {
  callbacks: MenuCallbacks;
}

function Menu({ callbacks }: Props) {
  const [menuShowing, setMenuShowing] = useState(false);
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    if (newValue == "flyWishy") {
      callbacks.upateVideoSource("./video/flyVideo.mp4");
    } else if (newValue == "lowTaperFade") {
      callbacks.upateVideoSource("./video/ninja.mp4");
    } else {
      console.log("unrecognized source");
    }
  };
  return (
    <StyledWrapper>
      <button
        className="collapse-button"
        onClick={() => {
          setMenuShowing(!menuShowing);
        }}
      >
        Menu
      </button>
      <div className={clsx("menu", menuShowing && "showing")}>
        <button
          onClick={() => {
            callbacks.lookAtPlane();
          }}
        >
          look at plane
        </button>
        <button
          onClick={() => {
            callbacks.lookAtGlobe();
          }}
        >
          look at globe
        </button>
        <div>
          <h1>Hello!</h1>
          <p>
            this is a prototype for a music visualizer for the song Fly by{" "}
            <a href="https://wishy.bandcamp.com/album/planet-popstar">Wishy.</a>
            I was on a delta flight and they had this plane visualizer thing
            where you can see where your plane was and I was listening to music
            and I was like damn this would actually be sort of a sick
            visualizer.
          </p>
          <video
            controls
            src="./video/sourceVideo.mp4"
            style={{ float: "right" }}
          ></video>
          <p>
            This visualizer can actually be used for ANY song you want. You can
            select what song you want to use in the dropdown menu here
          </p>
          <select name="cars" id="cars" onChange={handleSelectChange}>
            <option value="flyWishy">Fly - Wishy</option>
            <option value="lowTaperFade">Imagine</option>
          </select>
          <p>
            definitely looks better on a computer instead of a phone rn, but it
            is a WIP
          </p>
          <h3>controls??</h3>
          <p>
            I am still figuring out the best way to make this interactive, but
            for now you can:
          </p>
          <ul>
            <li>
              play/pause/seek the song with the button on the main screen behind
              the debug menu
            </li>
            <li>zoom - scroll or pinch zoom</li>
            <li>orbit around - left click or touch and drag</li>
          </ul>
          <p>
            you can also open up the <b>debug menu</b> and click on "look at
            globe" to have the camera still, and focus on the globe, or click
            "look at plane", to have the camera orbit around the plane
          </p>
          <h3>visualizer??</h3>
          <p>
            The color of the water, size and color of the orbiting dots, and
            ripples below the plane are all being effected live by the output of
            whatever video source you include. I do this by analyzing the
            frequency data coming in, and splitting it up into "bins" based on
            the lows, low mids, mids, high mids, and treble ranges of the song!
            I then also keep track of the average of each bin over the last 5
            seconds, so I can map the current value between a min and max value
            so no matter the volume of the song, we can get a good idea of if
            the current value is a peak or not. boring!!!!
          </p>
          <p>
            right now the bass is mapped to the pule beneath the plane, the high
            hats are the color of the water, and the satellites are each being
            effected by one of the bins
          </p>
          <p>
            we can really map these values (think of each bin as being a value
            between 0 and 1. For example, when a kick drum hits, the "bass" bin
            would be a 1, and then slowly fall back to 0 until it is kicked
            again, same with high hats with treble, and mids with vocal.) You
            probably know much more about this than me but I am not musically
            inclined so I feel like I approached this as a nerd instead of a
            musician
          </p>
          <h3>other</h3>
          <p>
            the cities are just some of the biggest cities in the world, but you
            could use whatever cities you wanted. You can really add whatever
            you want too, have the plane move as fast as you wanted, have the
            plane do barrel rolls, cause cataclysmic events on the world, play
            god, idk. I would say it is not really all that fun to use, but it
            sure works!
          </p>
          <h3>other ideas I had</h3>
          <ul>
            <li>have the city labels be the current lyrics of the song</li>
            <li>custom plane 3D model</li>
            <li>more things orbiting the world</li>
            <li>be able to upload your own video</li>
            <li>
              make the UI look like the inflight tv UI (watch movies, page
              flight attendant, etc)
            </li>
            <li>
              when idle, have the camera smoothly move around the plane for more
              interesting visuals
            </li>
          </ul>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: relative;
  z-index: 999;
  color: black;
  display: block;
  button {
    display: block;
    margin: 5px;
  }
  .collapse-button {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 80px;
    height: 80px;
    z-index: 1;
  }
  .menu {
    position: fixed;
    box-sizing: border-box;
    overflow-y: scroll;
    padding: 1rem;
    width: 100vw;
    height: 100vh;
    left: -100vw;
    top: 0px;
    transition: left 0.5s ease 0s;
    /* display: none; */
    background-color: rgba(255, 255, 255, 0.5);

    &.showing {
      top: 0px;
      left: 0px;
    }
    flex: 1;
  }
`;

export default Menu;
