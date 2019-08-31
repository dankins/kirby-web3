import React from "react";
import { KirbyChildProvider, overrideTheme } from "@kirby-web3/child-react";
import { EthereumChildPlugin, SignatureInterceptorPlugin } from "@kirby-web3/plugin-ethereum";

import { Viewport } from "./viewport/Viewport";
import { ReachRouterPlugin } from "./ReachRouterPlugin";

const theme = overrideTheme({
  headingFont: "Libre Franklin",
});

const plugins = [
  new ReachRouterPlugin(),
  new SignatureInterceptorPlugin({ autoSign: false }),
  new EthereumChildPlugin({
    rpcURL: "https://rinkeby.infura.io/v3/06b8a36891d649ffa92950aeac5a7874",
    network: "mainnet",
    portis: {
      appID: "1a382335-7ba0-4834-a3cd-dd1eff365f98",
    },
  }),
];

const App: React.FC = () => {
  return (
    <KirbyChildProvider plugins={plugins} theme={theme}>
      <Viewport />
    </KirbyChildProvider>
  );
};

export default App;
