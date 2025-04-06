import useUserStore from "../../Store/UserStore";
import clsx from "clsx";
import { useState } from "react";

interface Props {
  ref: React.RefObject<HTMLDialogElement | null>;
}

function EmailEntryDialog({ ref }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { user, setUser } = useUserStore();
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add form parameters to the URL
    if (!validateEmail(email)) {
      setError("invalid email!!!!");
      return;
    }
    setError(null);
    const formDataToSend = new URLSearchParams();
    formDataToSend.append("entry.1185891732", email);
    try {
      await fetch(
        "https://docs.google.com/forms/u/0/d/e/1FAIpQLSf_8R5BCqPQrgkZ8FTOacGjvIWK-uFiHW1Vk-5hKJWoBJg_HQ/formResponse",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formDataToSend.toString(),
        }
      );
      setUser(email);
      ref.current!.close();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  return (
    <dialog className={clsx("ios-modal")} ref={ref}>
      <img className={clsx("gloss")} src="/images/Gloss.svg" alt="" />
      <h1 className={clsx("ios-text")}>Enter your email</h1>
      <p>sign up for the wishy mailing list to enter the site</p>
      {error && <p>{error}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
      >
        <input
          autoFocus
          onChange={(e: any) => setEmail(e.target.value)}
          value={email}
          placeholder="Enter your email..."
          type="text"
        />
        <div style={{ marginTop: "1.4rem" }} className="buttonContainer">
          <button
            type="submit"
            disabled={email == ""}
            className={clsx("ios-button", "primary")}
          >
            <p className={clsx("ios-text")}>Submit</p>
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default EmailEntryDialog;
