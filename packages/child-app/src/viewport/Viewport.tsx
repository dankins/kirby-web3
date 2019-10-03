import * as React from "react";
import styled from "styled-components";
import { Router } from "@reach/router";

import { Web3Enable } from "../views/Web3Enable";
import { SignatureConfirm } from "../views/SignatureConfirm";

export const Viewport: React.FC = ({ children }) => {
  return (
    <Router>
      <Web3Enable path="/ethereum/web3enable/:network" />
      <SignatureConfirm path="/ethereum/confirm-signature" />
    </Router>
  );
};
