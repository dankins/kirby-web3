import * as React from "react";
import { Config, Web3Frame, EventNames } from "@web3frame/core-sdk";

export interface IWeb3FrameContext {
  web3frame: Web3Frame;
  provider?: any;
}

const web3frame = new Web3Frame();
const startingContext: IWeb3FrameContext = { web3frame };
export const Web3FrameContext = React.createContext<IWeb3FrameContext>(startingContext);

export interface Web3FrameProviderProps {
  config: Config;
}
export const Web3FrameProvider: React.SFC<Web3FrameProviderProps> = ({ children, config }) => {
  const [context, setContext] = React.useState<IWeb3FrameContext>(startingContext);

  console.log("render", web3frame.config, config);
  if (web3frame.config != config) {
    initializeWeb3Frame(config, context, setContext);
  }

  return (
    <>
      <Web3FrameContext.Provider value={context}>{children}</Web3FrameContext.Provider>
    </>
  );
};

function initializeWeb3Frame(
  config: Config,
  currentContext: IWeb3FrameContext,
  setContext: (ctx: IWeb3FrameContext) => void,
) {
  web3frame.initialize(config);
  setContext({ web3frame });

  web3frame.onNewProvider((provider: any) => {
    console.log("new provider:", provider);
    setContext({ ...currentContext, provider });
  });
}
