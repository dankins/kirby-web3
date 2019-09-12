import * as React from "react";
import { KirbyEthereum, KirbyEthereumContext, useKirbySelector } from "@kirby-web3/ethereum-react";
import { RouteComponentProps } from "@reach/router";
import queryString from "query-string";
import { ConnextParentPlugin, ConnextPluginState } from "@kirby-web3/plugin-connext";

export const ReceivePayment: React.FunctionComponent<RouteComponentProps> = props => {
  // connext
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);
  const connext = kirby.kirby.plugins.connext as ConnextParentPlugin;

  const publicIdentifier = useKirbySelector((state: any) => {
    return state.connext.channel ? (state.connext as ConnextPluginState).channel!.userPublicIdentifier : undefined;
  });

  // state
  const [loading, setLoading] = React.useState(false);

  // effects
  React.useMemo(() => {
    async function openChannel(): Promise<void> {
      console.log("opening channel");
      await connext.openChannel();
      await connext.getFreeBalance();
    }

    if (!publicIdentifier) {
      openChannel()
        .then(() => setLoading(false))
        .catch(err => {
          console.log("failed to open channel!", err);
        });
    }
  }, [publicIdentifier, connext]);

  const { preimage, paymentID, amount } = queryString.parse(window.location.search);
  console.log("location", window.location.search);
  const recipient = useKirbySelector((state: any) => {
    return state.connext.channel ? (state.connext as ConnextPluginState).channel!.userPublicIdentifier : undefined;
  });

  async function resolvePayment(): Promise<void> {
    await connext.resolvePayment(recipient, amount as string, preimage as string, paymentID as string);
  }

  const errors = [];
  if (!preimage || preimage === "") {
    errors.push("preimage not provided in query string");
  }
  if (!paymentID || paymentID === "") {
    errors.push("paymentID not provided in query string");
  }
  if (!amount || amount === "") {
    errors.push("amount not provided in query string");
  }

  if (errors.length > 0) {
    return (
      <div>
        {errors.map(e => (
          <div key={e}>ERROR! {e}</div>
        ))}
      </div>
    );
  }
  return (
    <div>
      <div>
        <span>recipient: </span> <strong>{recipient}</strong>
      </div>
      <div>
        <span>preimage: </span> <strong>{preimage}</strong>
      </div>
      <div>
        <span>payment ID: </span> <strong>{paymentID}</strong>
      </div>
      <div>
        <span>amount: </span> <strong>{paymentID}</strong>
      </div>
      <div>
        <button onClick={resolvePayment}>accept payment</button>
      </div>
    </div>
  );
};
