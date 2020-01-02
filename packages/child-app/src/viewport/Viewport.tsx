import * as React from "react";
import { Router } from "@reach/router";

import { Web3Enable } from "../views/Web3Enable";
import { SignatureConfirm } from "../views/SignatureConfirm";
import { Authenticate } from "../views/Authenticate";

export const Viewport: React.FC = ({ children }) => {
  return (
    <Router>
      <Web3Enable path="/ethereum/web3enable" />
      <SignatureConfirm path="/ethereum/confirm-signature" />
      <Authenticate path="/trustedweb/authenticate" />
    </Router>
  );
};
