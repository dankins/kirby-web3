import { Config } from "./Config";
import * as EventEmitter from "events";

export enum Status {
  READY = "READY",
  NEW = "NEW",
  INITIALIZING = "INITIALIZING",
}

export enum EventNames {
  NEW_PROVIDER = "NEW_PROVIDER",
}

export class Web3Frame {
  public config!: Config;
  public readonly: boolean;
  public status: Status;

  public eventEmitter: EventEmitter;

  public constructor() {
    this.readonly = true;
    this.status = Status.NEW;

    this.eventEmitter = new EventEmitter();
  }

  public async initialize(config: Config) {
    this.config = config;
    this.status = Status.INITIALIZING;

    setTimeout(() => this.eventEmitter.emit(EventNames.NEW_PROVIDER, { gary: "coleman" }), 1000);
  }

  public onNewProvider(cb: (data: any) => void): void {
    this.eventEmitter.on(EventNames.NEW_PROVIDER, cb);
  }
}
