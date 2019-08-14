import React from "react";
import { EthereumPlugin } from "@kirby-web3/child-core";
import { KirbyChildProvider, overrideTheme } from "@kirby-web3/child-react";

import { Viewport } from "./viewport/Viewport";

const theme = overrideTheme({
  headingFont: "Libre Franklin",
});

const plugins = [new EthereumPlugin()];

const App: React.FC = () => {
  return (
    <KirbyChildProvider plugins={plugins} theme={theme}>
      <Viewport />
    </KirbyChildProvider>
  );
};

export default App;
