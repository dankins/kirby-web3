import * as React from "react";
import { KirbyProvider, Kirby, KirbyContext } from "@kirby-web3/parent-react";
import { EthereumParentPlugin } from "@kirby-web3/plugin-ethereum";

export { useSelector as useKirbySelector } from "@kirby-web3/parent-react";

const plugins = [new EthereumParentPlugin()];

// @ts-ignore let the default value be null
export const KirbyEthereumContext = React.createContext<KirbyEthereum>(null);

const KirbyEthereumInner: React.FunctionComponent = ({ children }) => {
  const ctx = React.useContext(KirbyContext);
  const kirby = React.useMemo(() => {
    return new KirbyEthereum(ctx.kirby);
  }, [ctx]);
  return <KirbyEthereumContext.Provider value={kirby}>{children}</KirbyEthereumContext.Provider>;
};

export interface KirbyEthereumProviderProps {
  config: any;
}
export const KirbyEthereumProvider: React.FunctionComponent<KirbyEthereumProviderProps> = ({ config, children }) => {
  return (
    <KirbyProvider plugins={plugins} config={config}>
      <KirbyEthereumInner>{children}</KirbyEthereumInner>
    </KirbyProvider>
  );
};

export class KirbyEthereum {
  public kirby: Kirby;
  public ethereum: EthereumParentPlugin;
  public web3: any;
  constructor(kirby: Kirby) {
    this.kirby = kirby;
    this.ethereum = kirby.plugins.ethereum as EthereumParentPlugin;
    this.web3 = this.ethereum.web3;
  }

  public async getAccounts(): Promise<string[]> {
    return (this.kirby.plugins.ethereum as EthereumParentPlugin).getAccounts();
  }
}
