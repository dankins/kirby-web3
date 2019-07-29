export interface Config {
  ethereum?: EthereumConfig;
}

export interface EthereumConfig {
  readOnlyNodeURI: string;
}
