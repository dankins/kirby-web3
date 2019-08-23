// const Web3 = require("web3");
import debug = require("debug");

export class ChildIFrameProvider {
  public provider: any;
  private logger = debug("kirby:plugins:ethereum:ChildIFrameProvider");
  private send: (type: string, data: string) => void;

  public constructor(send: (type: string, data: string) => void) {
    this.send = send;
  }

  public async initialize(): Promise<void> {
    return;
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
    provider.on("data", (data: any) => this.handleOnEvent(data));
    if (provider.enable) {
      await provider.enable();
    }
  }

  public handleOnEvent(data: any): void {
    this.logger("handleOnEvent", data);
    this.send("WEB3_ON_DATA", data);
  }
}
