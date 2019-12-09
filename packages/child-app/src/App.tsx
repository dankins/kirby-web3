import React from "react";
import { KirbyChildProvider, overrideTheme } from "@kirby-web3/child-react";
import { EthereumChildPlugin, SignatureInterceptorPlugin } from "@kirby-web3/plugin-ethereum";
import { buildTrustedWebChildPlugin } from "@kirby-web3/plugin-trustedweb";
import { ConnextChildPlugin } from "@kirby-web3/plugin-connext";

import { Viewport } from "./viewport/Viewport";
import { ReachRouterPlugin } from "./ReachRouterPlugin";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
html {
    box-sizing: border-box;
}
*, :after, :before {
  box-sizing: inherit;
}

.por_portis-widget-frame {
  top: 0 !important;
  bottom: auto !important;
}
 @media (max-width: 576px)  {
   .por_portis-widget-frame {
     top: 0 !important;
     bottom: auto !important;
   }
 }
`;

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
    networks: {
      mainnet: process.env.REACT_APP_ETHEREUM_NODE_MAINNET!,
      rinkeby: process.env.REACT_APP_ETHEREUM_NODE_RINKEBY!,
    },
    defaultNetwork: "rinkeby",
    portis: {
      appID: process.env.REACT_APP_PORTIS_APP_ID!,
    },
  }),
  buildTrustedWebChildPlugin(process.env.REACT_APP_ID_HUB_URL!),
];

const App: React.FC = () => {
  return (
    <KirbyChildProvider plugins={plugins} theme={theme}>
      <GlobalStyle></GlobalStyle>
      <Viewport />
    </KirbyChildProvider>
  );
};

export default App;
