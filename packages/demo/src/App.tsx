import * as React from "react";
import Button from "react-bootstrap/Button";
import { getChain } from "evm-chains";
import { KirbyProvider, KirbyContext, IKirbyContext, useSelector } from "@kirby-web3/parent-react";
import { EthereumParentPlugin } from "@kirby-web3/plugin-ethereum";

const MyComponent = () => {
  const ctx = React.useContext<IKirbyContext>(KirbyContext);
  const ethereumPlugin = ctx.kirby.plugins.ethereum as EthereumParentPlugin;

  const kirbyData = useSelector((state: any) => {
    return {
      readonly: state.ethereum.readonly,
      account: state.ethereum.account
    };
  });

  async function requestSign(): Promise<any> {
    const accts = await ethereumPlugin.getAccounts();
    const web3 = ethereumPlugin.web3;
    const result = await web3.eth.personal.sign("hello", accts[0]);
    console.log("signature:", result);
    return result;
  }

  const [chainState, setChainState] = React.useState({
    network: "Unknown",
    block: "loading...",
    balance: 0
  });

  async function getWeb3Info(): Promise<any> {
    const web3 = ethereumPlugin.web3;
    const networkId = await web3.eth.net.getId()
    const networkObject = await getChain(networkId)
    const network = networkObject.name
    console.log("network", network);
    const block = await web3.eth.getBlockNumber()
    console.log("block", block);
    const accts = await ethereumPlugin.getAccounts();
    console.log("checking balance ", accts)
    let balance = 0
    if (accts && accts.length> 0) {
      console.log("getting balance...")
      balance = await web3.eth.getBalance(accts[0])
      console.log("balance", balance)
    }
    setChainState({network, block, balance})
  }

  React.useEffect(() => {

    ethereumPlugin.web3.currentProvider.enable()

    setTimeout(getWeb3Info, 0);
    const interval = setInterval(getWeb3Info, 1000);
    return () => clearInterval(interval);
  }, []);

  console.log("state.ethereum", ctx.kirby.plugins.ethereum)

  let statusDisplay
  let connectButton
  if (kirbyData.readonly) {
    statusDisplay = (
      <div>
        <div className="mainText">
          You are in
          <span style={{color: "#ff4444", padding: 10}}>
            read-only
          </span>
          mode
        </div>
        <div className="mainText">
          Click
          <span style={{color: "#0099CC", padding: 10}}>
            Connect
          </span>
          to select a web3 provider
        </div>
      </div>
    )
    connectButton = (
      <Button onClick={async () => ethereumPlugin.requestSignerWeb3()} variant="primary" size="lg">Connect</Button>
    )
  } else {
    statusDisplay = (
      <div>
        <div className="mainText">
          Connected as
          <span style={{color: "#0d47a1", paddingLeft: 10}}>
            {kirbyData.account}
          </span>
        </div>
        <div className="mainText">
          Your balance is
          <span style={{color: "#00C851", padding: 10}}>
            {chainState.balance/10**18}ETH
          </span>
        </div>
        <div className="mainText">
          <Button onClick={async () => requestSign()} variant="secondary" size="lg">Sign Message</Button>
        </div>
      </div>
    )
    connectButton = (
      <Button onClick={async () => ethereumPlugin.requestSignerWeb3()} variant="success" size="lg">Connected</Button>
    )
  }

  return (
    <div>
      <div style={{position: "absolute", right: "5%", top: "3%"}}>
        {connectButton}
      </div>

      <div style={{marginTop: "20%"}}>
        <div className="mainText">
          Demo
          <span style={{color: "#ff4081", padding: 10}}>
            Kirby
          </span>
          dApp on the
          <span style={{color: "#aa66cc", padding: 10}}>
            {chainState.network}
          </span>
          network
        </div>

        <div className="mainText">
          <span style={{color: "#ffbb33", paddingRight: 10}}>
            {chainState.block}
          </span>
          is the most recent block mined
        </div>

        {statusDisplay}

      </div>
    </div>
  );
};

const config = {
  dmz: {
    targetOrigin: "http://localhost:3002",
    iframeSrc: "http://localhost:3002",
  },
  ethereum: {
    readOnlyNodeURI: process.env.REACT_APP_ETHEREUM_NODE!,
  },
};

const plugins = [new EthereumParentPlugin()];

const App: React.FC = () => {
  return (
    <div className="App">
      <KirbyProvider plugins={plugins} config={config}>
        <MyComponent />
      </KirbyProvider>
    </div>
  );
};

export default App;
