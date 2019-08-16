import debug = require("debug");

import { Dispatch, AnyAction } from "redux";

export abstract class Plugin<C = undefined, D = any, A extends AnyAction = any> {
  public abstract name: string;
  public dependsOn: string[] = [];
  public dependencies: { [name: string]: any } = {};
  public logger!: debug.Debugger;
  public dispatch!: Dispatch<A>;
  public getState: any;
  public config!: C;

  public constructor(config?: C) {
    this.logger = debug("kirby:plugins");
    if (config) {
      this.config = config;
    }
  }

  public middleware?: any;

  public async initialize(
    plugins: { [name: string]: any },
    dispatch: Dispatch<AnyAction>,
    getState: () => any,
    config: C,
  ): Promise<void> {
    this.logger = debug("kirby:plugins:" + this.name);
    this.dispatch = dispatch;
    this.getState = getState;
    if (config) {
      this.config = config;
    }

    this.dependencies = {};
    this.dependsOn.forEach(key => {
      this.dependencies[key] = plugins[key];
    });
    await this.startup();
    this.logger(`started ${this.name} plugin`);
    return;
  }
  public startup(): Promise<void> {
    return Promise.resolve();
  }

  public abstract reducer(state: any, event: any): any;
}
