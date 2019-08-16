import * as React from "react";
import { LogInWithMetaMask, LogInWithPortis, LogInWithBurner, CoreContext } from "@kirby-web3/child-react";
import { EthereumChildPlugin } from "@kirby-web3/plugin-ethereum";

export const Web3Enable: React.FC = () => {
  const maybeCore = React.useContext(CoreContext);
  function selection(provider: string) {
    console.log("selected:", provider);
    (maybeCore!.plugins.ethereum as EthereumChildPlugin).enableWeb3(provider);
  }
  return (
    <div>
      <LogInWithMetaMask onSelection={selection} />
      <LogInWithPortis onSelection={selection} />
      <LogInWithBurner onSelection={selection} />
    </div>
  );
};
