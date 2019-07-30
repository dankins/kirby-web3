import * as React from "react";

import { Web3FrameProvider, Web3FrameContext, IWeb3FrameContext } from "@kirby-web3/parent-react";

async function getAccounts(ctx: IWeb3FrameContext, setAccount: (acct: string) => void) {
  if (!ctx.web3frame.ethereum!.readonly) {
    const accts = await ctx.web3frame.ethereum!.web3.eth.getAccounts();
    console.log("accounts from ParentIFrameProvider:", accts);
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

  async function requestSign() {
    const accts = await ctx.web3frame.ethereum!.web3.eth.getAccounts();
    const web3 = ctx.web3frame.ethereum!.web3;
    const result = await web3.eth.personal.sign("hello", accts[0]);
    console.log("signature:", result);
  }

  console.log("ctx:", ctx);
  return (
    <div>
      <div>config: {JSON.stringify(ctx.web3frame.config)}</div>
      <div>web3: {ctx.web3frame.ethereum!.readonly ? "read only" : "signer available"}</div>
      <div>account: {account}</div>
      <div>
        <button onClick={async () => ctx.web3frame.ethereum!.requestSignerWeb3()}>request signer web3 </button>
      </div>
      <div>
        {!ctx.web3frame.ethereum!.readonly ? <button onClick={async () => requestSign()}>web3 sign</button> : null}
      </div>
    </div>
  );
};

const config = {
  targetOrigin: "http://localhost:3002",
  iframeSrc: "http://localhost:3002",
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
