import * as React from "react";

import { Web3FrameProvider, Web3FrameContext, IWeb3FrameContext } from "@web3frame/react-sdk";

const MyComponent = () => {
  const ctx = React.useContext<IWeb3FrameContext>(Web3FrameContext);

  return (
    <div>
      <div>config: {JSON.stringify(ctx.web3frame.config)}</div>
      <div>provider: {ctx.provider && JSON.stringify(ctx.provider)}</div>
    </div>
  );
};

const config = {
  foo: "bar",
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
