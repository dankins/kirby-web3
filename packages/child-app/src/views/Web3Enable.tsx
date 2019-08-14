import * as React from "react";
import { LogInWithMetaMask, LogInWithPortis, LogInWithBurner, CoreContext } from "@kirby-web3/child-react";
import { EthereumPlugin } from "@kirby-web3/child-core";

export const Web3Enable: React.FC = () => {
  const maybeCore = React.useContext(CoreContext);
  function selection(provider: string) {
    console.log("selected:", provider);
    (maybeCore!.plugins.ethereum as EthereumPlugin).enableWeb3(provider);
  }
  return (
    <div>
      <LogInWithMetaMask onSelection={selection} />
      <LogInWithPortis onSelection={selection} />
      <LogInWithBurner onSelection={selection} />
    </div>
  );
};
