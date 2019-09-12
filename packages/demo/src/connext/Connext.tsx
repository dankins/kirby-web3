import * as React from "react";
import { RouteComponentProps, Router } from "@reach/router";

import { Home } from "./Home";
import { SendPayment } from "./SendPayment";
import { ReceivePayment } from "./ReceivePayment";

export const Connext: React.FunctionComponent<RouteComponentProps> = ({ children }) => {
  return (
    <Router>
      <Home path="/" />
      <SendPayment path="/send" />
      <ReceivePayment path="receive" />
    </Router>
  );
};
