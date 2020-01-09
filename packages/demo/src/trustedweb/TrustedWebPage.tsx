import * as React from "react";

import { RouteComponentProps } from "@reach/router";

import { KirbyEthereum, KirbyEthereumContext } from "@kirby-web3/ethereum-react";
import { Button } from "react-bootstrap";

export const TrustedWebPage: React.FunctionComponent<RouteComponentProps> = () => {
  // context
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);

  async function authenticate(): Promise<void> {
    const res = await kirby.trustedweb.requestAuthentication();
    alert(JSON.stringify(res));
  }
  return (
    <div>
      <div>Trusted Web POC</div>
      <div>
        <Button onClick={authenticate}>Authenticate</Button>
      </div>
    </div>
  );
};
