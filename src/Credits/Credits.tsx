import styled from "styled-components";

import { ReactComponent } from "./credits.md";

function Credits() {
  return (
    <StyledWrapper>
      <ReactComponent />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: scroll;
  background-color: black;
  color: white;
  box-sizing: border-box;
  padding: 1rem;
  /* Global styles for minimal, old web page appearance */
  body {
    font-family: monospace, monospace;
    background-color: #f0f0f0;
    color: #333;
    margin: 0;
    padding: 10px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    border-bottom: 1px solid #333;
    padding-bottom: 5px;
    margin-top: 0;
    margin-bottom: 10px;
  }
  p {
    margin-bottom: 10px;
    line-height: 1.5;
  }

  ul {
    padding-left: 20px;
  }

  li {
    margin-bottom: 5px;
  }

  a {
    color: #0066cc;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

export default Credits;
