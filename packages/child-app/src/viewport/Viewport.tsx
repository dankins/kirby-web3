import * as React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import { Web3Enable } from "../views/Web3Enable";

const StyledDiv = styled.div`
  padding: 10px 10px 25px 10px;
  display: flex;
  flex-direction: row-reverse;
  > div {
    background-color: #ffffff;
    border-radius: 4px 4px 4px;
    box-shadow: 0 2px 20px 0 rgba(128, 128, 128, 0.5);
    width: 375px;
    height: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

function viewSelector(state: any): any {
  if (state.ethereum.web3EnableRequestID) {
    return "web3Enable";
  }

  return null;
}

export const Viewport: React.FC = ({ children }) => {
  const selectedView = useSelector(viewSelector);

  let view: JSX.Element = <span />;
  switch (selectedView) {
    case "web3Enable":
      view = <Web3Enable />;
      break;
  }

  if (view === null) {
    return null;
  }

  return (
    <StyledDiv>
      <div>{view}</div>
    </StyledDiv>
  );
};
