import * as React from "react";
import { Config } from "@web3frame/core-sdk";

export interface IWeb3FrameContext {
  status: string;
  loading: boolean;
  config: Config;
}

type contextType = IWeb3FrameContext | null;

export const Web3FrameContext = React.createContext<IWeb3FrameContext | null>(null);

export interface Web3FrameProviderProps {
  config: Config;
}
export const Web3FrameProvider: React.SFC<Web3FrameProviderProps> = ({ children, config }) => {
  const [context, setContext] = React.useState<IWeb3FrameContext | null>(null);

  if (!context) {
    setContext({ config, status: "initialized", loading: false });
  } else if (context.config != config) {
    context.config = config;
    setContext(context);
  }

  return (
    <>
      <Web3FrameContext.Provider value={context}>{children}</Web3FrameContext.Provider>
    </>
  );
};
