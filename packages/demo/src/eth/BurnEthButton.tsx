import * as React from "react";
import { Button } from "react-bootstrap";
import { KirbyEthereum, KirbyEthereumContext } from "@kirby-web3/ethereum-react";

/*
 * This button generates a transaction that sends Ether to the 0x address.
 * This is extremely stupid and you probably don't want to use it.
 * However, this is a simple way to test Ethereum transactions are working properly.
 */
export const BurnEthButton: React.FunctionComponent = () => {
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);
  const [status, setStatus] = React.useState("new");

  async function beginTx(): Promise<void> {
    setStatus("starting");

    await kirby.ethereum.provider.enable();

    kirby.web3.eth
      .sendTransaction({
        from: kirby.web3.defaultAccount,
        to: "0x0000000000000000000000000000000000000000",
        value: "0",
      })
      .on("transactionHash", (hash: any) => {
        setStatus("sent:" + hash);
      })
      .on("receipt", (receipt: any) => {
        console.log({ receipt });
      })
      .on("confirmation", (confNumber: any, receipt: any) => {
        console.log({ confNumber });
      })
      .on("error", (error: any) => {
        setStatus("error");
        console.log({ error });
      });
  }

  if (status === "error") {
    return (
      <>
        <Button onClick={() => setStatus("new")}>Burn Ether</Button>
        <span>Rejected! Click to reset</span>
      </>
    );
  } else if (status === "starting") {
    return (
      <>
        <Button disabled>Burn Ether</Button>
        <span>Waiting for wallet...</span>
      </>
    );
  } else if (status.startsWith("sent:")) {
    return (
      <>
        <Button disabled>Burn Ether</Button>
        <span>Transaction hash: {status.split(":")[1]}</span>
      </>
    );
  }

  return <Button onClick={beginTx}>Burn Ether</Button>;
};
