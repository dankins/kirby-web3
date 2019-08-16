import { Plugin } from "./Plugin";
import { createStore, Store, combineReducers, applyMiddleware } from "redux";
import { default as dynamicMiddlewares, resetMiddlewares, addMiddleware } from "redux-dynamic-middlewares";
import {} from "redux-dynamic-middlewares";

import debug from "debug";
const logger = debug("kirby:core");
debug.enable("kirby:*");

export abstract class Core<P extends Plugin<any>> {
  private pluginList!: P[];
  private logger = logger;
  public redux!: Store;
  public plugins: { [key: string]: P } = {};

  public constructor() {
    this.redux = createStore((state: any = {}, action: any) => state, applyMiddleware(dynamicMiddlewares));
  }

  public abstract defaultPlugins(): P[];

  public async initialize(plugins: P[], config: any): Promise<void> {
    const defaultPlugins = this.defaultPlugins();
    this.pluginList = defaultPlugins.concat(plugins);
    const reducers: { [key: string]: any } = {};
    let middleware: any = [];
    this.pluginList.map(plugin => {
      reducers[plugin.name] = plugin.reducer.bind(plugin);
      this.plugins[plugin.name] = plugin;

      if (plugin.middleware) {
        middleware = middleware.concat(plugin.middleware);
      }
    }, {});

    this.redux.replaceReducer(combineReducers(reducers));
    resetMiddlewares();
    addMiddleware(...middleware);

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
