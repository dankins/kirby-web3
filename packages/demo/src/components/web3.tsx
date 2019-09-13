import * as React from "react";
import styled from "styled-components";
import makeBlockie from "ethereum-blockies-base64";

import { ProviderTypes } from "@kirby-web3/plugin-ethereum";
import { Burner } from "./logos/Burner";
import { Portis } from "./logos/Portis";
import { MetaMask } from "./logos/Metamask";

const KirbyAvatar = styled.span`
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
  }
  > svg {
    position: absolute;
    bottom: 0;
    transform: translate(-9px, 5px);
  }
`;

export interface AccountAvatarProps {
  account: string;
  providerType: ProviderTypes;
  onClick?: (() => void) | undefined;
}
export const AccountAvatar: React.FunctionComponent<AccountAvatarProps> = ({ account, providerType, onClick }) => {
  let logo;
  switch (providerType) {
    case ProviderTypes.BURNER:
      logo = <Burner />;
      break;
    case ProviderTypes.METAMASK:
      logo = <MetaMask />;
      break;
    case ProviderTypes.PORTIS:
      logo = <Portis />;
      break;
  }
  const blockie = React.useMemo(() => {
    return makeBlockie(account);
  }, [account]);

  return (
    <KirbyAvatar onClick={onClick}>
      <img src={blockie} height={40} width={40} />
      {logo}
    </KirbyAvatar>
  );
};
