// const Web3 = require("web3");
import debug = require("debug");

export class ChildIFrameProvider {
  public provider: any;
  private logger = debug("kirby:plugins:ethereum:ChildIFrameProvider");
  private send: (type: string, data: string) => void;
  private dapparatus: Dapparatus;

  public constructor(send: (type: string, data: string) => void) {
    this.send = send;
    this.dapparatus = new Dapparatus();
  }

  public async initialize(): Promise<void> {}

  public handleIFrameMessage(req: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger("WEB3_REQUEST", req, this.provider);
      this.provider[req.method](req.params, (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(data[0]);
        }
        
        console.log("RESOLVE WITH:",result)
        resolve(result);
      } else {
        this.provider[req.method](req.params, (err: any, data: any) => {
          console.log("req.params result:",req.params,data[0]);
          if (err) {
            reject(err);
          } else {
            console.log("RESOLVING WITH:",data[0])
            resolve(data[0]);
          }
        });
      }
    });
  }

  public async setConcreteProvider(provider: any) {
    this.provider = provider;
    provider.on("data", this.handleOnEvent);
    if (provider.enable) {
      await provider.enable();
    }
  }

  public handleOnEvent(data: any) {
    this.logger("handleOnEvent", data);
    this.send("WEB3_ON_DATA", data);
  }
}
