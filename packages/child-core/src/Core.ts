import { Plugin } from "./Plugin";
import {
  createStore,
  Store,
  combineReducers,
  applyMiddleware,
  Middleware,
  AnyAction,
  MiddlewareAPI,
  Action,
} from "redux";

import debug from "debug";
import { Dispatch } from "react";
import { ParentHandler } from "./plugins/ParentHandler";
const logger = debug("kirby:core");
debug.enable("kirby:*");

export class Core {
  private pluginList: Plugin[];
  private logger = logger;
  public redux: Store;
  public plugins: { [key: string]: Plugin } = {};

  constructor(plugins: Plugin[]) {
    this.pluginList = ([new ParentHandler()] as Plugin[]).concat(plugins);
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

  public async initialize(): Promise<void> {
    this.logger("initializing plugins");
    await Promise.all(this.pluginList.map(p => p.initialize(this.redux.dispatch, this.redux.getState)));
    this.logger("initialized plugins");
  }

  public async receiveMessage(message: any): Promise<void> {
    this.logger("core receive message", message);
    this.redux.dispatch(message.request);
  }

  public getPlugins(): { [key: string]: Plugin } {
    return this.plugins;
  }
}
