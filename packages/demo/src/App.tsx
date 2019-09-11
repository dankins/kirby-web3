import * as React from "react";
import {
  KirbyEthereum,
  KirbyEthereumProvider,
  KirbyEthereumContext,
  useKirbySelector,
} from "@kirby-web3/ethereum-react";

import Button from "react-bootstrap/Button";
import { getChain } from "evm-chains";

const MyComponent = () => {
  const [, setBlockNumber] = React.useState<string[]>([]);
  const [, setSignature] = React.useState<string | null>(null);
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);

  const readonly = useKirbySelector((state: any) => state.ethereum.readonly);
  const account = useKirbySelector((state: any) => state.ethereum.account);

  React.useEffect(() => {
    if (readonly === true) {
      kirby.enable().catch(err => {
        console.log("error enabling web3", err);
      });
    }
  }, [kirby, readonly]);

  React.useEffect(() => {
    async function updateBlockNumber(): Promise<void> {
      setBlockNumber(await kirby.web3.eth.getBlockNumber());
    }
    const ticker = setInterval(updateBlockNumber, 10000);
    updateBlockNumber().catch(err => {
      console.log("error updating block number", err);
    });

    return function cleanup(): void {
      clearInterval(ticker);
    };
  }, [kirby.web3.eth]);

  async function requestSign(): Promise<any> {
    const web3 = kirby!.web3;
    const result = await web3.eth.personal.sign("hello", account);
    console.log("signature:", result);
    setSignature(result);
    return result;
  }

  const [chainState, setChainState] = React.useState({
    network: "Unknown",
    block: "loading...",
    balance: 0,
  });

  async function getWeb3Info(): Promise<any> {
    const web3 = kirby.web3;
    const networkId = await web3.eth.net.getId();
    const networkObject = await getChain(networkId);
    const network = networkObject.name;
    const block = await web3.eth.getBlockNumber();
    const accts = await web3.eth.getAccounts();
    let balance = 0;
    if (accts && accts.length > 0) {
      balance = await web3.eth.getBalance(accts[0]);
    }
    setChainState({ network, block, balance });
  }

  React.useEffect(() => {
    kirby.web3.currentProvider.enable();

    setTimeout(getWeb3Info, 0);
    const interval = setInterval(getWeb3Info, 1000);
    return () => clearInterval(interval);
  }, []);

  let statusDisplay;
  let connectButton;
  if (readonly) {
    statusDisplay = (
      <div>
        <div className="mainText">
          You are in
          <span style={{ color: "#ff4444", padding: 10 }}>read-only</span>
          mode
        </div>
        <div className="mainText">
          Click
          <span style={{ color: "#0099CC", padding: 10 }}>Connect</span>
          to select a web3 provider
        </div>
      </div>
    );
    connectButton = (
      <Button
        onClick={async () => {
          kirby.web3.currentProvider.enable();
        }}
        variant="primary"
        size="lg"
      >
        Connect
      </Button>
    );
  } else {
    statusDisplay = (
      <div>
        <div className="mainText">
          Connected as
          <span style={{ color: "#0d47a1", paddingLeft: 10 }}>{account}</span>
        </div>
        <div className="mainText">
          Your balance is
          <span style={{ color: "#00C851", padding: 10 }}>{chainState.balance / 10 ** 18}ETH</span>
        </div>
        <div className="mainText">
          <Button onClick={async () => requestSign()} variant="secondary" size="lg">
            Sign Message
          </Button>
        </div>
      </div>
    );
    connectButton = (
      <Button
        onClick={() => {
          alert("do some reconnect thing here");
        }}
        variant="success"
        size="lg"
      >
        Connected
      </Button>
    );
  }

  return (
    <div>
      <div style={{ position: "absolute", right: "5%", top: "3%" }}>{connectButton}</div>
      <div style={{ marginTop: "20%" }}>
        <div className="mainText">
          Demo
          <span style={{ color: "#ff4081", padding: 10 }}>Kirby</span>
          dApp on the
          <span style={{ color: "#aa66cc", padding: 10 }}>{chainState.network}</span>
          network
        </div>

        <div className="mainText">
          <span style={{ color: "#ffbb33", paddingRight: 10 }}>{chainState.block}</span>
          is the most recent block
        </div>

        {statusDisplay}
      </div>
    </div>
  );
};

const config = {
  dmz: {
    targetOrigin: "http://localhost:3002",
    iframeSrc: "http://localhost:3002",
  },
  ethereum: {
    readOnlyNodeURI: process.env.REACT_APP_ETHEREUM_NODE!,
  },
};

const App: React.FC = () => {
  return (
    <div className="App">
      <KirbyEthereumProvider config={config}>
        <MyComponent />
      </KirbyEthereumProvider>
    </div>
  );
};

export default App;
