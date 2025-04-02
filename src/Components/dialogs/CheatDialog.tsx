import clsx from "clsx";
import { useState } from "react";

interface Props {
  ref: React.RefObject<HTMLDialogElement | null>;
  onCheatSubmitted(cheat: string): void;
}

function CheatDialog({ ref, onCheatSubmitted }: Props) {
  const [cheatCodeText, setCheatCodeText] = useState("");

  return (
    <dialog className={clsx("ios-modal")} ref={ref}>
      <img className={clsx("gloss")} src="/images/Gloss.svg" alt="" />
      <h1 className={clsx("ios-text")}>Cheat Code</h1>
      <p style={{ marginBottom: "10px" }} className={clsx("ios-text")}>
        Hint: Look at the side of the plane
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCheatSubmitted(cheatCodeText);
          setCheatCodeText("");
          ref.current!.close();
        }}
      >
        <input
          autoFocus
          onChange={(e: any) => setCheatCodeText(e.target.value)}
          value={cheatCodeText}
          placeholder="Enter a cheat code..."
          type="text"
        />
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
            type="submit"
            disabled={cheatCodeText == ""}
            className={clsx("ios-button", "primary")}
          >
            <p className={clsx("ios-text")}>Submit</p>
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default CheatDialog;
