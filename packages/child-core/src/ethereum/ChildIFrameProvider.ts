// const Web3 = require("web3");
import debug = require("debug");
import console = require("console");
const Web3 = require('web3');

export class ChildIFrameProvider {
  public provider: any;
  private logger = debug("kirby:plugins:ethereum:ChildIFrameProvider");
  private send: (type: string, data: string) => void;

  public constructor(send: (type: string, data: string) => void) {
    this.send = send;
  }

  public async initialize(): Promise<void> {}

  public handleIFrameMessage(req: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger("WEB3_REQUEST", req, this.provider);

      

       /*
        right here a web3 action comes in from the parent
          let's say it's personal_sign
          there should probably be a big switch that handles these
          and passes them into dapparatus-core / burner provider / web3 connect
          we will handle extra logic here too depending on permissions and autopilot etc

       */

      this.logger("----------->> METHOD: ",req.method,req.params,this.provider)
      let result: { id: any; jsonrpc: any; result: string[]; }
      if(req.params[0].method=="eth_accounts"){
        let web3 = new Web3(this.provider)
        web3.eth.getAccounts((err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            this.logger("----------->> DATA:",data);
            resolve( {
              id: req.params[0].id,
              jsonrpc: req.params[0].jsonrpc,
              result: data
            } );
          }
        })
      } else if(req.params[0].method=="personal_sign"){
        let web3 = new Web3(this.provider)
        web3.eth.personal.sign(req.params[0].params[0],req.params[0].params[1],(err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            this.logger("----------->> DATA:",data);
            resolve( {
              id: req.params[0].id,
              jsonrpc: req.params[0].jsonrpc,
              result: data
            } );
          }
        })
      } else {
        this.logger("unknown METHOD:",req.params[0].method)
        this.provider[req.method](req.params, (err: any, data: any) => {
          this.logger("DEBUG, THIS IS WHAT YOU SHOULD RETURN:", data)
          if (err) {
            reject(err);
          } else {
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
