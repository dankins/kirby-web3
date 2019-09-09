import * as React from "react";
import { RouteComponentProps, Link } from "@reach/router";
import { KirbyEthereum, KirbyEthereumContext, useKirbySelector } from "@kirby-web3/ethereum-react";
import { ConnextParentPlugin, ConnextPluginState, EtherAddress } from "@kirby-web3/plugin-connext";
import { ethers } from "ethers";

export const SendPayment: React.FunctionComponent<RouteComponentProps> = () => {
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);
  const connext = kirby.kirby.plugins.connext as ConnextParentPlugin;

  const publicIdentifier = useKirbySelector((state: any) => {
    return state.connext.channel ? (state.connext as ConnextPluginState).channel!.userPublicIdentifier : undefined;
  });

  // state
  const [loading, setLoading] = React.useState(false);
  const [paymentID, setPaymentID] = React.useState<string | null>(null);
  const [preimage, setPreimage] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState<number | null>(null);

  // effects
  React.useMemo(() => {
    async function openChannel(): Promise<void> {
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

  const etherBalance = useKirbySelector((state: any) => {
    console.log("etherBalance", state);
    if (state.connext.balances[EtherAddress]) {
      const etherBal = state.connext.balances[EtherAddress];

      const value = etherBal[Object.keys(etherBal)[0]];
      const bn = ethers.utils.bigNumberify(value);
      return ethers.utils.formatEther(bn);
    }
    return undefined;
  });

  // functions
  async function sendPayment(): Promise<void> {
    const amountEther = amount!.toString();
    const comment = "hello world";
    setLoading(true);
    const response = await connext.sendPaymentRequest(amountEther, comment);
    console.log("response!", response);
    setPreimage(response.preImage);
    setPaymentID(response.paymentId);
    setLoading(false);
  }

  // render

  if (!publicIdentifier && loading) {
    return <div>opening channel...</div>;
  }

  if (!preimage) {
    return (
      <div>
        <div>public identifier: {publicIdentifier}</div>
        <div>ether balance: {etherBalance ? etherBalance : undefined}</div>
        <div>
          <span>Send Payment:</span>
          <input type="number" onChange={() => setAmount(0.00001)} max={etherBalance ? parseFloat(etherBalance) : 0} />
        </div>
        <div>
          <button onClick={sendPayment} disabled={!amount || loading}>
            send
          </button>
        </div>
      </div>
    );
  }

  const link = encodeURI(`/connext/receive?preimage=${preimage}&paymentID=${paymentID}&amount=${amount}`);

  return (
    <div>
      <h3>success!</h3>
      <div>
        <div>
          <div>
            <span>preimage: </span> <strong>{preimage}</strong>
          </div>
          <div>
            <span>payment ID: </span> <strong>{paymentID}</strong>
          </div>
          <div>
            <span>amount: </span> <strong>{amount}</strong>
          </div>
        </div>
        <div>the following link can be used to claim the payment:</div>
        <div>
          <Link to={link}>payment</Link>
        </div>
        <div>{link}</div>
      </div>
    </div>
  );
};
