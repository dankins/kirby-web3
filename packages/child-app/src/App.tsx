import React from "react";
import { KirbyChildProvider, overrideTheme } from "@kirby-web3/child-react";
import { EthereumChildPlugin, SignatureInterceptorPlugin } from "@kirby-web3/plugin-ethereum";
import { ConnextChildPlugin } from "@kirby-web3/plugin-connext";

import { Viewport } from "./viewport/Viewport";
import { ReachRouterPlugin } from "./ReachRouterPlugin";

const theme = overrideTheme({
  headingFont: "Libre Franklin",
});

const plugins = [
  new ReachRouterPlugin(),
  new ConnextChildPlugin({
    ethProviderUrl: "https://rinkeby.infura.io/v3/06b8a36891d649ffa92950aeac5a7874",
    nodeUrl: "wss://rinkeby.indra.connext.network/api/messaging",
  }),
  new SignatureInterceptorPlugin({ autoSign: false }),
  new EthereumChildPlugin({
    burnerPreference: "always",
    rpcURL: process.env.REACT_APP_ETHEREUM_NODE!,
    network: "rinkeby",
    portis: {
      appID: process.env.REACT_APP_PORTIS_APP_ID!,
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
