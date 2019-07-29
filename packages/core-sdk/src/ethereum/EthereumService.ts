import { EthereumConfig } from "../Config";
import { EventEmitter } from "events";

// web3.js hates typescript *eyeroll*
const WebWsProvider = require("web3-providers-ws");
const Web3HttpProvider = require("web3-providers-http");
const Web3 = require("web3");

export enum EthereumEvents {
  NEW_WEB3_INSTANCE = "ETHEREUM_NEW_WEB3_INSTANCE",
}

export class EthereumService {
  private config: EthereumConfig;
  private ee: EventEmitter;
  public web3: any;
  public readonly: boolean;

  constructor(config: EthereumConfig, ee: EventEmitter) {
    this.config = config;
    this.ee = ee;
    this.readonly = true;
    this.initializeWeb3();
  }

  public onNewWeb3(cb: (data: any) => void): void {
    this.ee.on(EthereumEvents.NEW_WEB3_INSTANCE, cb);
  }

  public initializeWeb3(): void {
    let readOnlyProvider;
    if (this.config.readOnlyNodeURI.startsWith("ws")) {
      readOnlyProvider = new WebWsProvider(this.config.readOnlyNodeURI);
      this.readonly = true;
    } else if (this.config.readOnlyNodeURI.startsWith("http")) {
      readOnlyProvider = new Web3HttpProvider(this.config.readOnlyNodeURI);
      this.readonly = true;
    } else {
      throw new Error("could not initialize provider");
    }
    this.web3 = new Web3(readOnlyProvider);
    this.ee.emit(EthereumEvents.NEW_WEB3_INSTANCE, this.web3);
  }

  public async requestSignerWeb3(): Promise<void> {
    const win = window as any;
    if (win.ethereum) {
      console.log("injected ethereum: ", win.ethereum);
      await win.ethereum.enable();
      this.readonly = false;
      this.web3 = new Web3(win.ethereum);
      this.ee.emit(EthereumEvents.NEW_WEB3_INSTANCE, this.web3);
    } else {
      throw new Error("no injected web3 provided");
    }
  }
}
