export interface Config {
  ethereum?: EthereumConfig;
  targetOrigin: string;
  iframeSrc: string;
}

export interface EthereumConfig {
  readOnlyNodeURI: string;
}
