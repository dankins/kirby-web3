import { ChildIFrameProvider } from "./ChildIFrameProvider";
import * as Portis from "@portis/web3";
import { MiddlewareAPI, Action, Dispatch } from "redux";
import { ChildPlugin } from "@kirby-web3/child-core";
import * as BurnerProvider from "burner-provider";
import { REQUEST_VIEW_ACTION } from "@kirby-web3/child-core/build/ViewPlugin";

export interface EthereumChildPluginConfig {
  network: "mainnet" | "rinkeby" | "ropsten";
  rpcURL: string;
  portis?: {
    appID: string;
  };
}

export class EthereumChildPlugin extends ChildPlugin<EthereumChildPluginConfig> {
  public name = "ethereum";
  private provider!: ChildIFrameProvider;

  public async startup(): Promise<void> {
    this.provider = new ChildIFrameProvider((type, data) => {
      // parent.postMessage({ type, data }, "http://localhost:3001");
    });
    await this.provider.initialize();
  }

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    if (action.type === "PARENT_REQUEST" && action.data.type === "WEB3_REQUEST") {
      this.provider
        .handleIFrameMessage(action.data.data)
        .then(response => {
          this.logger("got a response", response);
          this.dispatch({ type: "PARENT_RESPONSE", requestID: action.requestID, payload: response });
        })
        .catch(err => {
          this.logger("middleware error: ", err);
        });
    } else if (action.type === "PARENT_REQUEST" && action.data.type === "WEB3_ENABLE") {
      this.dispatch({
        type: REQUEST_VIEW_ACTION,
        payload: { route: "/ethereum/web3enable", requestID: action.requestID },
      });
      return;
    }
    next(action);
  };

  public reducer(state: any = {}, action: any): any {
    if (action.type === "PARENT_RESPONSE" && action.payload && action.payload.requestType === "WEB3_ENABLE") {
      const { web3EnableRequestID, ...nextState } = state;
      nextState.provider = action.payload.provider;
      return nextState;
    }
    return state;
  }

  public async enableWeb3(provider: string, requestID: string): Promise<void> {
    if (provider === "MetaMask") {
      const win = window as any;
      if (win.ethereum) {
        await this.provider.setConcreteProvider(win.ethereum);
      } else {
        throw new Error("no injected web3 provided");
      }
    } else if (provider === "Portis") {
      const portis = new Portis(this.config.portis!.appID, this.config.network);
      await this.provider.setConcreteProvider(portis.provider);
    } else if (provider === "Burner Wallet") {
      const burnerProvider = new BurnerProvider(this.config.rpcURL);
      await this.provider.setConcreteProvider(burnerProvider);
    } else {
      throw new Error("unrecognized provider");
    }
    this.dispatch({ type: "PARENT_RESPONSE", requestID, payload: { requestID, provider, requestType: "WEB3_ENABLE" } });
  }
}
