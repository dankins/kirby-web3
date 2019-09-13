import * as React from "react";
import { ButtonGroup, Button } from "react-bootstrap";
import { useKirbySelector, KirbyEthereumContext, KirbyEthereum } from "@kirby-web3/ethereum-react";
import { Network } from "@kirby-web3/plugin-ethereum";

export const NetworkSwitcher = () => {
  // state
  const [loading, setLoading] = React.useState(false);
  // context
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);
  // kirby
  const network = useKirbySelector((state: any) => state.ethereum.network);

  // functions
  async function setNetwork(networkName: Network): Promise<void> {
    setLoading(true);
    await kirby.ethereum.changeNetwork(networkName);
    setLoading(false);
  }

  return (
    <ButtonGroup aria-label="Basic example">
      <Button
        variant="secondary"
        active={network === "mainnet"}
        onClick={async () => setNetwork("mainnet")}
        disabled={loading}
      >
        Mainnet
      </Button>
      <Button
        variant="secondary"
        active={network === "rinkeby"}
        onClick={() => setNetwork("rinkeby")}
        disabled={loading}
      >
        Rinkeby
      </Button>
    </ButtonGroup>
  );
};
