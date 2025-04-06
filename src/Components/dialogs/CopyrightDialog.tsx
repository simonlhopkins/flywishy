import clsx from "clsx";
import { useState } from "react";

interface Props {
  ref: React.RefObject<HTMLDialogElement | null>;
}

function CopyrightDialog({ ref }: Props) {
  return (
    <dialog className={clsx("ios-modal")} ref={ref}>
      <img className={clsx("gloss")} src="/images/Gloss.svg" alt="" />
      <h1 className={clsx("ios-text")}>Copyright</h1>
      <p>
        © Winspear. All music owned by the label. Additional content used with
        permission or from public domain sources.
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
      </div>
    </dialog>
  );
}

export default CopyrightDialog;
