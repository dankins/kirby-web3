import * as React from "react";
import { Router } from "@reach/router";

import { KirbyEthereumProvider } from "@kirby-web3/ethereum-react";

import { ConnextParentPlugin } from "@kirby-web3/plugin-connext";

import { Connext } from "./connext/Connext";
import { Home } from "./home/Home";

const config = {
  dmz: {
    targetOrigin: process.env.REACT_APP_TARGET_ORIGIN,
    iframeSrc: process.env.REACT_APP_IFRAME_SRC,
  },
  ethereum: {
    defaultNetwork: "rinkeby",
  },
};

const plugins = [new ConnextParentPlugin()];

const App: React.FC = () => {
  return (
    <div className="App">
      <KirbyEthereumProvider plugins={plugins} config={config}>
        <Router>
          <Home path="/" />
          <Connext path="/connext/*" />
        </Router>
      </KirbyEthereumProvider>
    </div>
  );
};

export default App;
