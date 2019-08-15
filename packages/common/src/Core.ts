import { Plugin } from "./Plugin";
import { createStore, Store, combineReducers, applyMiddleware } from "redux";

import debug from "debug";
const logger = debug("kirby:core");
debug.enable("kirby:*");

export abstract class Core<P extends Plugin<any>> {
  private pluginList: P[];
  private logger = logger;
  public redux: Store;
  public plugins: { [key: string]: P } = {};

  constructor(managerPlugin: P, plugins: P[]) {
    this.pluginList = [managerPlugin].concat(plugins);
    const reducers: { [key: string]: any } = {};
    let middleware: any = [];
    this.pluginList.map(plugin => {
      reducers[plugin.name] = plugin.reducer.bind(plugin);
      this.plugins[plugin.name] = plugin;

      if (plugin.middleware) {
        middleware = middleware.concat(plugin.middleware);
      }
    }, {});

    this.redux = createStore(combineReducers(reducers), applyMiddleware(...middleware));
  }

  public async initialize(config: any): Promise<void> {
    this.logger("initializing plugins");
    await Promise.all(
      this.pluginList.map(p => p.initialize(this.plugins, this.redux.dispatch, this.redux.getState, config[p.name])),
    );
    this.logger("initialized plugins");
  }

  public async receiveMessage(message: any): Promise<void> {
    this.logger("core receive message", message);
    this.redux.dispatch(message.request);
  }

  public getPlugins(): { [key: string]: P } {
    return this.plugins;
  }
}
