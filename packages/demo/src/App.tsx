import * as React from "react";
import {
  KirbyEthereum,
  KirbyEthereumProvider,
  KirbyEthereumContext,
  useKirbySelector,
} from "@kirby-web3/ethereum-react";

const MyComponent = () => {
  const [accounts, setAccounts] = React.useState<string[]>([]);
  const [signature, setSignature] = React.useState<string | null>(null);
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);

  const kirbyData = useKirbySelector((state: any) => {
    return {
      readonly: state.ethereum.readonly,
      account: state.ethereum.account,
    };
  });

  React.useEffect(() => {
    async function getAccounts(): Promise<void> {
      const newAccounts = await kirby.web3.eth.getAccounts();
      setAccounts(newAccounts);
    }

    getAccounts().catch(err => {
      console.log("error getting accounts", err);
    });
  }, [kirby, kirbyData.readonly]);

  async function requestSign(): Promise<any> {
    const web3 = kirby!.web3;
    const result = await web3.eth.personal.sign("hello", (await accounts)[0]);
    console.log("signature:", result);
    setSignature(result);
    return result;
  }

  return (
    <div>
      <div>web3: {kirbyData.readonly ? "read only" : "signer available"}</div>
      <div>account: {accounts.join(",")}</div>
      <div>
        <button onClick={async () => kirby.web3.currentProvider.enable()}>request signer web3 </button>
      </div>
      <div>{!kirbyData.readonly ? <button onClick={async () => requestSign()}>web3 sign</button> : null}</div>
      {signature ? <div>signature: {signature}</div> : null}
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
