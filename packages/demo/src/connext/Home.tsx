import * as React from "react";
import { KirbyEthereum, KirbyEthereumContext, useKirbySelector } from "@kirby-web3/ethereum-react";
import { RouteComponentProps, Link } from "@reach/router";
import { ConnextParentPlugin, ConnextPluginState, EtherAddress } from "@kirby-web3/plugin-connext";
import { ethers } from "ethers";

export const Home: React.FunctionComponent<RouteComponentProps> = props => {
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);
  const connext = kirby.kirby.plugins.connext as ConnextParentPlugin;

  const publicIdentifier = useKirbySelector((state: any) => {
    return state.connext.channel ? (state.connext as ConnextPluginState).channel!.userPublicIdentifier : undefined;
  });

  const etherBalance = useKirbySelector((state: any) => {
    if (state.connext.balances[EtherAddress]) {
      const etherBal = state.connext.balances[EtherAddress];

      const value = etherBal[Object.keys(etherBal)[0]];
      const bn = ethers.utils.bigNumberify(value);
      return ethers.utils.formatEther(bn);
    }
    return undefined;
  });

  async function openChannel(): Promise<void> {
    await connext.openChannel();
    await connext.getFreeBalance();
  }

  return (
    <div>
      <div>hello from connext</div>
      <div>
        <button onClick={openChannel}>open channel</button>
      </div>
      <div>
        your publicIdentifier: <strong>{publicIdentifier}</strong>
      </div>
      <div>ether balance: {etherBalance ? etherBalance : undefined}</div>
      <div>
        <button onClick={() => connext.addFunds()}>add funds</button>
      </div>
      <div>
        <Link to="send">
          <button>send payment</button>
        </Link>
      </div>
    </div>
  );
};
