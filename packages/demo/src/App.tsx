import * as React from "react";

import { Web3FrameProvider, Web3FrameContext, IWeb3FrameContext } from "@web3frame/react-sdk";

const MyComponent = () => {
  const ctx = React.useContext<IWeb3FrameContext>(Web3FrameContext);

  console.log("ctx:", ctx);
  return (
    <div>
      <div>config: {JSON.stringify(ctx.web3frame.config)}</div>
      <div>web3: {ctx.ethereum!.web3 ? "available" : "not available"}</div>
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
