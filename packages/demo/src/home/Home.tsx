import * as React from "react";

import Button from "react-bootstrap/Button";
import { RouteComponentProps } from "@reach/router";

import { KirbyEthereum, KirbyEthereumContext, useKirbySelector } from "@kirby-web3/ethereum-react";

import { CenteredTextBlock } from "../components/text";
import { HeaderRow, CenteredContainer } from "../components/containers";

import { StatusDisplay } from "./StatusDisplay";
import { ReadOnlyMode } from "./ReadOnlyMode";
import { NetworkSwitcher } from "./NetworkSwitcher";
import { AccountSwitcher } from "./AccountSwitcher";

export const Home: React.FunctionComponent<RouteComponentProps> = () => {
  // state
  const [, setSignature] = React.useState<string | null>(null);

  const [chainState, setChainState] = React.useState({
    block: "loading...",
    balance: 0,
  });

  // context
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);

  // kirby selectors
  const readonly = useKirbySelector((state: any) => state.ethereum.readonly);
  const account = useKirbySelector((state: any) => state.ethereum.account);
  const network = useKirbySelector((state: any) => state.ethereum.network);

  React.useEffect(() => {
    if (readonly === true) {
      kirby.enable().catch(err => {
        console.log("error enabling web3", err);
      });
    }
  }, [kirby, readonly]);

  async function requestSign(): Promise<any> {
    const web3 = kirby!.web3;
    try {
      const result = await web3.eth.personal.sign("hello", account);
      console.log("signature:", result);
      setSignature(result);
    } catch (err) {
      console.log("Request rejected", err);
      setSignature("request rejected");
    }
  }

  React.useEffect(() => {
    async function getWeb3Info(): Promise<any> {
      try {
        const web3 = kirby.web3;
        const balance = account ? await web3.eth.getBalance(account) : 0;
        const block = await web3.eth.getBlockNumber();

        setChainState({ block, balance });
      } catch (err) {
        console.log("error getting web3 info", err);
      }
    }

    const interval = setInterval(getWeb3Info, 10000);
    getWeb3Info().catch(err => {
      console.log("error getting web3 info", err);
    });
    return () => clearInterval(interval);
  }, [kirby, account]);

  if (readonly) {
    return (
      <div>
        <ReadOnlyMode></ReadOnlyMode>
      </div>
    );
  }

  return (
    <div>
      <HeaderRow>
        <AccountSwitcher />
        <NetworkSwitcher />
      </HeaderRow>
      <CenteredContainer>
        <StatusDisplay account={account} balance={chainState.balance} block={chainState.block} network={network} />
        <CenteredTextBlock>
          <Button onClick={async () => requestSign()} variant="secondary" size="lg">
            Sign Message
          </Button>
        </CenteredTextBlock>
      </CenteredContainer>
    </div>
  );
};
