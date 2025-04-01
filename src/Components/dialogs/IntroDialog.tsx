import useUserStore from "../../Store/UserStore";
import clsx from "clsx";

interface Props {
  ref: React.RefObject<HTMLDialogElement | null>;
  onPlay(): void;
}

function IntroDialog({ ref, onPlay }: Props) {
  const { setHasSeenIntro } = useUserStore();
  const onDismiss = () => {
    setHasSeenIntro(true);
    ref.current!.close();
  };
  return (
    <dialog className={clsx("ios-modal")} ref={ref}>
      <img className={clsx("gloss")} src="/images/Gloss.svg" alt="" />
      <h1 className={clsx("ios-text")}>Welcome</h1>
      <p style={{ marginBottom: "10px" }} className={clsx("ios-text")}>
        Welcome aboard. On this flight you'll get an exclusive listen to Wishy's
        new EP, Planet Popstar! Whenever you're ready, click the play button,
        and enjoy the flight
      </p>
      <div style={{ marginTop: "10px" }} className="buttonContainer">
        <button
          onClick={() => {
            onDismiss();
          }}
          className="ios-button"
        >
          <p className={clsx("ios-text")}>Close</p>
        </button>
        <button
          onClick={() => {
            onPlay();
            onDismiss();
          }}
          autoFocus
          className={clsx("ios-button", "primary")}
        >
          <p className={clsx("ios-text")}>Play Now</p>
        </button>
      </div>
    </dialog>
  );
}

export default IntroDialog;
