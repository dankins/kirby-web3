import * as React from "react";

import { Web3FrameProvider, IWeb3FrameContext, Web3FrameContext } from "@web3frame/react-sdk";

const MyComponent = () => {
  const ctx = React.useContext<IWeb3FrameContext | null>(Web3FrameContext);

  return <div>{ctx && ctx.config.foo}</div>;
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
