import * as React from "react";
import { CenteredTextBlock, FocusWord } from "../components/text";
import { colors } from "../components/colors";
import { Button } from "react-bootstrap";
import { useKirbySelector, KirbyEthereum, KirbyEthereumContext } from "@kirby-web3/ethereum-react";

export const ReadOnlyMode = () => {
  // state
  const [loading, setLoading] = React.useState(false);
  // context
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);
  // kirby
  const network = useKirbySelector((state: any) => state.ethereum.network);

  async function changeAccount(): Promise<void> {
    try {
      await kirby.ethereum.changeAccount();
    } catch (err) {
      console.log("error changing account", err);
    }
  }
  return (
    <>
      <Button onClick={changeAccount}>Connect to Ethereum</Button>
    </>
  );
};
