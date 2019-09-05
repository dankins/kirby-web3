import * as React from "react";
import {
  KirbyEthereum,
  KirbyEthereumProvider,
  KirbyEthereumContext,
  useKirbySelector,
} from "@kirby-web3/ethereum-react";

const MyComponent = () => {
  const [blockNumber, setBlockNumber] = React.useState<string[]>([]);
  const [signature, setSignature] = React.useState<string | null>(null);
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);

  console.log("render MyComponent");

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

  return (
    <div>
      <div>web3: {readonly ? "read only" : "signer available"}</div>
      <div>kirby account: {account}</div>
      <div>
        <button onClick={async () => kirby.web3.currentProvider.enable()}>request signer web3 </button>
      </div>
      <div>{!readonly ? <button onClick={async () => requestSign()}>web3 sign</button> : null}</div>
      {signature ? <div>signature: {signature}</div> : null}
      {blockNumber ? <div>blockNumber: {blockNumber}</div> : null}
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
