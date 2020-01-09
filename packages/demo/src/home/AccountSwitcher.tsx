import * as React from "react";
import styled from "styled-components";
import {
  useKirbySelector,
  KirbyEthereum,
  KirbyEthereumContext,
  AuthenticationResult,
} from "@kirby-web3/ethereum-react";
import makeBlockie from "ethereum-blockies-base64";

import Unknown from "./Unknown.png";

export interface KirbyAvatarProps {
  isLoading: boolean;
}
const KirbyAvatar = styled.span<KirbyAvatarProps>`
  position: relative;
  display: inline-block;
  margin: 8px;
  cursor: pointer;

  > img {
    border-radius: 20%;
    margin: 0 auto;
    text-align: center;
    position: relative;
    display: inline-block;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);
    opacity: ${props => (props.isLoading ? "0.75" : "1")};
  }
  > svg {
    position: absolute;
    bottom: 0;
    transform: translate(-9px, 5px);
  }
`;

export const AccountSwitcher = () => {
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);
  const auth: AuthenticationResult = useKirbySelector((state: any) => state.trustedweb.auth);
  const loadingAuth: boolean = useKirbySelector((state: any) => state.trustedweb.loadingAuth);

  const ethAccount = auth && auth.did.replace("did:ethr:", "");
  const blockie = React.useMemo(() => {
    if (!ethAccount) {
      return;
    }

    return makeBlockie(ethAccount);
  }, [ethAccount]);

  async function showHome(): Promise<void> {
    try {
      kirby.trustedweb.showHome();
    } catch (err) {
      console.log("error changing account", err);
    }
  }

  const avatarSrc = auth ? blockie : Unknown;

  return (
    <div>
      <KirbyAvatar onClick={showHome} isLoading={loadingAuth}>
        <img src={avatarSrc} height={40} width={40} alt={ethAccount} />
      </KirbyAvatar>
    </div>
  );
};
