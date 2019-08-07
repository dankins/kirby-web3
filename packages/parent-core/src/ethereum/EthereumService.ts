import { EthereumConfig } from "../Config";
import { EventEmitter } from "events";
import { ParentIFrameProvider } from "./ParentIFrameProvider";
import { DMZ } from "../DMZ";

// web3.js hates typescript *eyeroll*
const WebWsProvider = require("web3-providers-ws");
const Web3HttpProvider = require("web3-providers-http");
const Web3 = require("web3");

export enum EthereumEvents {
  NEW_WEB3_INSTANCE = "ETHEREUM_NEW_WEB3_INSTANCE",
}

/*

  Kirby would call .sign on this class and it will send a message through to child.core
  by calling personal.sign on ParentIFrameProvider

 */

export class EthereumService {
  private dmz: DMZ;
  private config: EthereumConfig;
  private ee: EventEmitter;
  public web3: any;
  public readonly: boolean;

  constructor(config: EthereumConfig, ee: EventEmitter, dmz: DMZ) {
    this.dmz = dmz;
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
      const provider = new ParentIFrameProvider(this.dmz);
      this.web3 = new Web3(provider);
      this.ee.emit(EthereumEvents.NEW_WEB3_INSTANCE, this.web3);
    } else {
      throw new Error("no injected web3 provided");
    }
  }
}
