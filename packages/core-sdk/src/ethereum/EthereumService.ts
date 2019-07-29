import { EthereumConfig } from "../Config";
import { EventEmitter } from "events";

// web3.js hates typescript *eyeroll*
const WebWsProvider = require("web3-providers-ws");
const Web3HttpProvider = require("web3-providers-http");
const Web3 = require("web3");

export enum EthereumEvents {
  NEW_PROVIDER = "ETHEREUM_NEW_PROVIDER",
}

export class EthereumService {
  private config: EthereumConfig;
  private ee: EventEmitter;
  public provider: any;
  public web3: any;

  constructor(config: EthereumConfig, ee: EventEmitter) {
    this.config = config;
    this.ee = ee;
    this.initializeProvider();
    this.web3 = new Web3(this.provider);
  }

  public onNewWeb3(cb: (data: any) => void): void {
    this.ee.on(EthereumEvents.NEW_PROVIDER, cb);
  }

  public initializeProvider(): void {
    let newProvider;
    if (this.config.readOnlyNodeURI.startsWith("ws")) {
      newProvider = new WebWsProvider(this.config.readOnlyNodeURI);
    } else if (this.config.readOnlyNodeURI.startsWith("http")) {
      newProvider = new Web3HttpProvider(this.config.readOnlyNodeURI);
    } else {
      throw new Error("could not initialize provider");
    }
    this.provider = newProvider;
    this.ee.emit(EthereumEvents.NEW_PROVIDER, newProvider);
  }
}
