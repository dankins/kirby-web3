import debug = require("debug");

import { Dispatch, Middleware, AnyAction, MiddlewareAPI, Action } from "redux";

export abstract class Plugin {
  public abstract name: string;
  protected logger!: debug.Debugger;
  protected dispatch!: Dispatch<AnyAction>;
  protected getState: any;

  public constructor() {
    this.logger = debug("kirby:plugins");
  }

  public middleware?: any;

  public async initialize(dispatch: Dispatch<AnyAction>, getState: () => any): Promise<void> {
    this.logger = debug("kirby:plugins:" + this.name);
    this.dispatch = dispatch;
    this.getState = getState;
    await this.startup();
    this.logger(`started ${this.name} plugin`);
    return;
  }
  public startup(): Promise<void> {
    return Promise.resolve();
  }

  public sendToParent(requestID: number, data: any): void {
    parent.postMessage({ requestID: requestID, type: "RESPONSE", data }, "http://localhost:3001");
  }

  public abstract reducer(state: any, event: any): any;
}
