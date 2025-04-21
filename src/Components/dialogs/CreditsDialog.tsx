import clsx from "clsx";
import { useState } from "react";
import styled from "styled-components";

interface Props {
  ref: React.RefObject<HTMLDialogElement | null>;
}

function CreditsDialog({ ref }: Props) {
  return (
    <StyledDialogWrapper className={clsx("ios-modal")} ref={ref}>
      <img className={clsx("gloss")} src="/images/Gloss.svg" alt="" />
      <h1 className={clsx("ios-text")}>Credits</h1>
      <p>music by Wishy!</p>
      <p>
        website by <span className="simon">Simon!</span>
      </p>
      <div style={{ marginTop: "1.4rem" }} className="buttonContainer">
        <button
          onClick={() => {
            ref.current!.close();
          }}
          className="ios-button"
        >
          <p className={clsx("ios-text")}>Close</p>
        </button>
        <button
          onClick={() => {
            window.open("/credits", "_blank")?.focus();
          }}
          className="ios-button"
        >
          <p className={clsx("ios-text")}>More</p>
        </button>
      </div>
    </StyledDialogWrapper>
  );
}

const StyledDialogWrapper = styled.dialog`
  @keyframes spin {
    0% {
      transform: rotateZ(0);
    }
    100% {
      transform: rotateZ(360deg);
    }
  }
  .simon {
    display: inline-block;
    animation: spin 2000ms linear infinite;
  }
`;

export default CreditsDialog;
