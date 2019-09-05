import debug = require("debug");
import WebWsProvider = require("web3-providers-ws");
import Web3HttpProvider = require("web3-providers-http");

export class ChildIFrameProvider {
  public provider: any;
  private logger = debug("kirby:plugins:ethereum:ChildIFrameProvider");
  private eventHandler: (e: { type: string; payload: any }) => void;

  public constructor(eventHandler: (e: { type: string; payload: any }) => void) {
    this.eventHandler = eventHandler;
  }

  public async initialize(readOnlyRPCUrl: string): Promise<void> {
    let readOnlyProvider;
    if (readOnlyRPCUrl.startsWith("ws")) {
      readOnlyProvider = new WebWsProvider(readOnlyRPCUrl);
    } else {
      readOnlyProvider = new Web3HttpProvider(readOnlyRPCUrl);
    }

    await this.setConcreteProvider(readOnlyProvider);
  }

  public async handleIFrameMessage(req: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger("WEB3_REQUEST", req, this.provider);
      req.method = this.provider.sendAsync ? "sendAsync" : "send";
      this.provider[req.method](req.params, (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(data[0]);
        }
      });
    });
  }

  public async setConcreteProvider(provider: any): Promise<void> {
    this.provider = provider;
    // set up listeners for providers that support subscriptions
    if (provider.on) {
      provider.on("data", (data: any) => {
        this.eventHandler({ type: "WEB3_ON_DATA", payload: data });
      });
      provider.on("accountsChanged", (accounts: string[]) => {
        this.eventHandler({ type: "WEB3_ON_ACCOUNTSCHANGED", payload: accounts });
      });
      provider.on("networkChanged", (network: any) => {
        this.eventHandler({ type: "WEB3_ON_NETWORKCHANGED", payload: network });
      });
    }

    if (provider.enable) {
      await provider.enable();
    }
  }

  public async enable(): Promise<void> {
    return this.provider.enable();
  }

  public async send(data: any, cb: any): Promise<any> {
    return this.provider.sendAsync(data, cb);
  }
  
  public async sendBatch(methods: any[], moduleInstance: any): Promise<any[]> {
    return this.provider.sendBatch(methods, moduleInstance);
  }

  public async subscribe(subscribeMethod: string, subscriptionMethod: string, parameters: any[]): Promise<string> {
    return this.provider.subscribe(subscribeMethod, subscriptionMethod, parameters);
  }

  public async unsubscribe(subscriptionId: string, unsubscribeMethod: string): Promise<boolean> {
    return this.provider.unsubscribe(subscriptionId, unsubscribeMethod);
  }

  public async clearSubscriptions(unsubscribeMethod: string): Promise<boolean> {
    return this.provider.clearSubscriptions(unsubscribeMethod);
  }

  public on(type: string, callback: () => void): void {
    if (this.provider.on) {
      this.provider.on(type, callback);
    } else {
      console.warn("setting up a subscription on a provider that does not support them");
    }
  }

  public removeListener(type: string, callback: () => void): void {
    return this.provider.removeListener(type, callback);
  }

  public removeAllListeners(type: string): void {
    this.provider.removeAllListeners(type);
  }

  public reset(): void {
    this.provider.reset();
  }

  public reconnect(): void {
    this.provider.reconnect();
  }

  public disconnect(code: number, reason: string): void {
    this.provider.disconnect(code, reason);
  }
}
