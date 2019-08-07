import { Config } from "./Config";
import * as EventEmitter from "events";
import { EthereumService } from "./ethereum/EthereumService";
import { DMZ } from "./DMZ";

export enum Status {
  READY = "READY",
  NEW = "NEW",
  INITIALIZING = "INITIALIZING",
}

/*

Web3Frame should probably be renamed to Kirby
then we should have wrapper functions for things like "login"
 - calling login would trigger "sign" on the EthereumService 

 */

export class Web3Frame {
  public config!: Config;
  public readonly: boolean;
  public status: Status;

  private dmz: DMZ;
  private ee: EventEmitter;

  public ethereum?: EthereumService;

  public constructor() {
    this.readonly = true;
    this.status = Status.NEW;

    this.dmz = new DMZ();

    this.ee = new EventEmitter();
  }

  public async initialize(config: Config) {
    this.config = config;
    this.status = Status.INITIALIZING;
    const dmzPromise = this.dmz.initialize(config);

    if (this.config.ethereum) {
      this.ethereum = new EthereumService(this.config.ethereum, this.ee, this.dmz);
    }
    await dmzPromise;
  }
}
