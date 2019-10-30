import * as React from "react";
import { RouteComponentProps } from "@reach/router";
import { BurnEthButton } from "./BurnEthButton";

export const EthPage: React.FunctionComponent<RouteComponentProps> = () => {
  return (
    <div>
      <BurnEthButton />
    </div>
  );
};
