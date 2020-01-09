import * as React from "react";
import { KirbyProvider, Kirby, KirbyContext } from "@kirby-web3/parent-react";
import { EthereumParentPlugin } from "@kirby-web3/plugin-ethereum";
import { TrustedWebParentPlugin } from "@kirby-web3/plugin-trustedweb";

export { useSelector as useKirbySelector } from "@kirby-web3/parent-react";

const defaultPlugins = [new EthereumParentPlugin(), new TrustedWebParentPlugin()];

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
  plugins?: any[];
}
export const KirbyEthereumProvider: React.FunctionComponent<KirbyEthereumProviderProps> = ({
  config,
  plugins,
  children,
}) => {
  const allPlugins = React.useMemo(() => {
    return plugins ? [...defaultPlugins, ...plugins] : defaultPlugins;
  }, [plugins]);
  return (
    <KirbyProvider plugins={allPlugins} config={config}>
      <KirbyEthereumInner>{children}</KirbyEthereumInner>
    </KirbyProvider>
  );
};

export class KirbyEthereum {
  public kirby: Kirby;
  public ethereum: EthereumParentPlugin;
  public trustedweb: TrustedWebParentPlugin;
  public web3: any;
  constructor(kirby: Kirby) {
    this.kirby = kirby;
    this.ethereum = kirby.plugins.ethereum as EthereumParentPlugin;
    this.web3 = this.ethereum.web3;
    this.trustedweb = kirby.plugins.trustedweb as TrustedWebParentPlugin;
  }

  public async getAccounts(): Promise<string[]> {
    return (this.kirby.plugins.ethereum as EthereumParentPlugin).getAccounts();
  }

  public async enable(): Promise<void> {
    return (this.kirby.plugins.ethereum as EthereumParentPlugin).web3.eth.currentProvider.enable();
  }
}
