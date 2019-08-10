// const Web3 = require("web3");
import { Dapparatus } from "dapparatus-core";

export class ChildIFrameProvider {
  public provider: any;
  private send: (type: string, data: string) => void;
  private dapparatus: Dapparatus;

  public constructor(send: (type: string, data: string) => void) {
    this.send = send;
    this.dapparatus = new Dapparatus();
  }

  public async initialize(): Promise<void> {
    await this.dapparatus.init();
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
    return new Promise(async (resolve, reject) => {
      console.log("WEB3_REQUEST", req);

      /*
        right here a web3 action comes in from the parent
          let's say it's personal_sign
          there should probably be a big switch that handles these
          and passes them into dapparatus-core / burner provider / web3 connect
          we will handle extra logic here too depending on permissions and autopilot etc

       */
      if(true){ //set this to false to blindly proxy so you can get the return data structure correctly
        console.log("------------>> METHOD: ",req.method,req.params)
        let result: { id: any; jsonrpc: any; result: string[]; }
        if(req.params[0].method=="eth_accounts"){
          console.log("THEY WANT ACCOUNT LIST, GIVE THEM:",this.dapparatus.accounts)
          result = {
            id: req.params[0].id,
            jsonrpc: req.params[0].jsonrpc,
            result: this.dapparatus.accounts
          }
        } else if(req.params[0].method=="personal_sign"){
          console.log("THEY WANT TO SIGN",req.params[0].params[0],"with account",req.params[0].params[1],this.dapparatus.accounts)
          result = {
            id: req.params[0].id,
            jsonrpc: req.params[0].jsonrpc,
            result: await this.dapparatus.sign(req.params[0].params[0],req.params[0].params[1])
          }
        } else if(req.params[0].method=="personal_ecRecover"){
          console.log("THEY WANT TO RECOVER",req.params[0].params[0],"with sig",req.params[0].params[1])
          result = {
            id: req.params[0].id,
            jsonrpc: req.params[0].jsonrpc,
            result: await this.dapparatus.recover(req.params[0].params[0],req.params[0].params[1])
          }
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

  public handleOnEvent(data: any) {
    console.log("handleOnEvent", data);
    this.send("WEB3_ON_DATA", data);
  }
}
