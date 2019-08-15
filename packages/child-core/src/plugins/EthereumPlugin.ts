import { ChildIFrameProvider } from "../ethereum/ChildIFrameProvider";
import * as Portis from "@portis/web3";
import { MiddlewareAPI, Action } from "redux";
import { Dispatch } from "react";
import { ChildPlugin } from "../ChildPlugin";
import * as BurnerProvider from "burner-provider";

export class EthereumPlugin extends ChildPlugin<{}> {
  private provider!: ChildIFrameProvider;
  public name = "ethereum";

  public async startup(): Promise<void> {
    this.provider = new ChildIFrameProvider((type, data) => {
      // parent.postMessage({ type, data }, "http://localhost:3001");
    });
    await this.provider.initialize();
  }

  public middleware = (api: MiddlewareAPI<any, any>) => (next: Dispatch<any>) => <A extends Action<any>>(
    action: any,
  ): void => {
    if (action.type === "PARENT_REQUEST" && action.data.type === "WEB3_REQUEST") {
      this.provider.handleIFrameMessage(action.data.data).then(response => {
        this.logger("got a response", response);
        this.sendToParent(action.requestID, response);
      });
    }
    next(action);
  };

  public reducer(state: any = {}, message: any): any {
    if (message.type === "PARENT_REQUEST" && message.data.type === "WEB3_ENABLE") {
      return { ...state, web3EnableRequestID: message.requestID };
    }
    return state;
  }

  public async enableWeb3(provider: string): Promise<void> {
    const requestID = this.getState().ethereum.web3EnableRequestID;
    if (provider === "MetaMask") {
      const win = window as any;
      if (win.ethereum) {
        await this.provider.setConcreteProvider(win.ethereum);
      } else {
        throw new Error("no injected web3 provided");
      }
    } else if (provider === "Portis") {
      const portis = new Portis("1a382335-7ba0-4834-a3cd-dd1eff365f98", "mainnet");
      await this.provider.setConcreteProvider(portis.provider);
    } else if (provider === "Burner Wallet") {
      const burnerProvider = new BurnerProvider("https://mainnet.infura.io/v3/06b8a36891d649ffa92950aeac5a7874");
      await this.provider.setConcreteProvider(burnerProvider);
    } else {
      throw new Error("unrecognized provider");
    }
    this.dispatch({ type: "PARENT_RESPONSE", requestID, plugin: "ethereum" });
  }
}
