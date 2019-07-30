import React from "react";
import { WindowMessageHandler } from "@kirby-web3/child-core";

console.log("hello from demo-iframe");

const handler = new WindowMessageHandler();
console.log("iframe handler initialized", handler);

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>hello, iframe</h1>
    </div>
  );
};

export default App;
