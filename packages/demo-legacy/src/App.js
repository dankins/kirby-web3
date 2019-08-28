import React from 'react';
import Button from 'react-bootstrap/Button';
import { KirbyProvider, KirbyContext, useSelector } from "@kirby-web3/parent-react";
import { EthereumParentPlugin } from "@kirby-web3/plugin-ethereum";

const config = {
  dmz: {
    targetOrigin: "http://localhost:3002",
    iframeSrc: "http://localhost:3002",
  },
  ethereum: {
    readOnlyNodeURI: process.env.REACT_APP_ETHEREUM_NODE,
  },
};

const plugins = [new EthereumParentPlugin()];

function App() {
  const ctx = React.useContext(KirbyContext);
  const ethereumPlugin = ctx.kirby.plugins.ethereum;

  const kirbyData = useSelector((state) => {
    return {
      readonly: state.ethereum.readonly,
      account: state.ethereum.account,
    };
  });

  return (
    <div className="App">
      <KirbyProvider plugins={plugins} config={config}>
        <div style={{position:"absolute",right:"5%",top:"3%"}}>
          <Button onClick={async () => ethereumPlugin.requestSignerWeb3()} variant="primary" size="lg">Connect</Button>
        </div>
        <div style={{textAlign:"center", fontSize:28, width:"100%", marginTop:"30%"}}>
          Demo Kirby dApp.
        </div>
      </KirbyProvider>
    </div>
  );
}

export default App;
