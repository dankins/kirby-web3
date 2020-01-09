export const ETHEREUM_WEB3_CHANGE_ACCOUNT = "ETHEREUM_WEB3_CHANGE_ACCOUNT";
export const ETHEREUM_WEB3_CHANGE_NETWORK = "ETHEREUM_WEB3_CHANGE_NETWORK";

export interface ChangeAccount {
  type: typeof ETHEREUM_WEB3_CHANGE_ACCOUNT;
}
export interface ChangeNetwork {
  type: typeof ETHEREUM_WEB3_CHANGE_NETWORK;
  payload: Network;
}

export enum ProviderTypes {
  BURNER = "Burner Wallet",
  PORTIS = "Portis",
  METAMASK = "MetaMask",
  READONLY = "Read Only",
  TRUSTEDWEB = "TrustedWeb",
}

export type Network = "mainnet" | "rinkeby" | "ropsten";

export const NetworkID: { [key: string]: number } = {
  mainnet: 1,
  ropsten: 3,
  rinkeby: 4,
};

export const IDToNetwork: { [key: number]: Network } = {
  1: "mainnet",
  3: "ropsten",
  4: "rinkeby",
};
