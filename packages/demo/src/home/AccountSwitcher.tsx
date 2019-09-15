import * as React from "react";
import { useKirbySelector, KirbyEthereum, KirbyEthereumContext } from "@kirby-web3/ethereum-react";
import { AccountAvatar } from "../components/web3";

export const AccountSwitcher = () => {
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);
  const account = useKirbySelector((state: any) => state.ethereum.account);
  const providerType = useKirbySelector((state: any) => state.ethereum.providerType);

  if (!account) {
    return null;
  }

  async function changeAccount(): Promise<void> {
    return kirby.ethereum.changeAccount();
  }

  return (
    <div>
      <AccountAvatar account={account} providerType={providerType} onClick={changeAccount} />
    </div>
  );
};
