import { Config } from "./Config";
import * as EventEmitter from "events";
import { EthereumService } from "./ethereum/EthereumService";

export enum Status {
  READY = "READY",
  NEW = "NEW",
  INITIALIZING = "INITIALIZING",
}

export class Web3Frame {
  public config!: Config;
  public readonly: boolean;
  public status: Status;

  private ee: EventEmitter;

  public ethereum?: EthereumService;

  public constructor() {
    this.readonly = true;
    this.status = Status.NEW;

    this.ee = new EventEmitter();
  }

  public async initialize(config: Config) {
    this.config = config;
    this.status = Status.INITIALIZING;

    if (this.config.ethereum) {
      this.ethereum = new EthereumService(this.config.ethereum, this.ee);
    }
  }
}
