import * as React from "react";
import styled from "styled-components";
import { Router } from "@reach/router";

import { Web3Enable } from "../views/Web3Enable";
import { SignatureConfirm } from "../views/SignatureConfirm";

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

export const Viewport: React.FC = ({ children }) => {
  return (
    <StyledDiv>
      <Router>
        <Web3Enable path="/ethereum/web3enable" />
        <SignatureConfirm path="/ethereum/confirm-signature" />
      </Router>
    </StyledDiv>
  );
};
