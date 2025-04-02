import { Navigate } from "react-router-dom";
import useUserStore from "../Store/UserStore";
import { useRef, useState } from "react";
import styled from "styled-components";

function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useUserStore();
  const inputRef = useRef<HTMLInputElement>(null);
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
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  return (
    <StyledWrapper>
      {user && <Navigate to="/" />}
      <h1>Sign up for mailing list to enter!</h1>
      <form onSubmit={onSubmit}>
        {error && <p>{error}</p>}
        <input
          ref={inputRef}
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
          type="text"
        />
        <button type="submit">submit</button>
      </form>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
`;

export default LoginPage;
