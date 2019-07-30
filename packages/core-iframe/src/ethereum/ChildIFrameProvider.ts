// const Web3 = require("web3");

export class ChildIFrameProvider {
  public provider: any;
  private send: (type: string, data: string) => void;

  public constructor(send: (type: string, data: string) => void) {
    this.send = send;
  }

  public async initialize(): Promise<void> {
    const win = window as any;
    if (win.ethereum) {
      await win.ethereum.enable();
      this.provider = win.ethereum;
      // this.ee.emit(EthereumEvents.NEW_WEB3_INSTANCE, this.web3);
      this.provider.on("data", this.handleOnEvent);
    } else {
      throw new Error("no injected web3 provided");
    }
  }

  public handleIFrameMessage(req: any): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log("WEB3_REQUEST", req);
      this.provider[req.method](req.params, (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(data[0]);
        }
      });
    });
  }

  public handleOnEvent(data: any) {
    console.log("handleOnEvent", data);
    this.send("WEB3_ON_DATA", data);
  }
}
