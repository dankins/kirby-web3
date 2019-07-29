import * as React from "react";

import { Web3FrameProvider, Web3FrameContext, IWeb3FrameContext } from "@web3frame/react-sdk";

async function getAccounts(ctx: IWeb3FrameContext, setAccount: (acct: string) => void) {
  if (!ctx.web3frame.ethereum!.readonly) {
    await (window as any).ethereum.enable();
    const accts = await ctx.web3frame.ethereum!.web3.eth.getAccounts();
    if (accts && accts.length > 0) {
      setAccount(accts[0]);
    }
  }
}

const MyComponent = () => {
  const ctx = React.useContext<IWeb3FrameContext>(Web3FrameContext);

  const [account, setAccount] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAccounts(ctx, setAccount);
  }, [ctx]);

  console.log("ctx:", ctx);
  return (
    <div>
      <div>config: {JSON.stringify(ctx.web3frame.config)}</div>
      <div>web3: {ctx.web3frame.ethereum!.readonly ? "read only" : "signer available"}</div>
      <div>account: {account}</div>
      <div>
        <button onClick={async () => ctx.web3frame.ethereum!.requestSignerWeb3()}>request signer web3 </button>
      </div>
    </div>
  );
};

const config = {
  ethereum: {
    readOnlyNodeURI: process.env.REACT_APP_ETHEREUM_NODE!,
  },
};

const App: React.FC = () => {
  return (
    <div className="App">
      <Web3FrameProvider config={config}>
        <MyComponent />
      </Web3FrameProvider>
    </div>
  );
};

export default App;
