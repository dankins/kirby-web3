import * as Portis from "@portis/web3";
import Web3 = require("web3");
import { MiddlewareAPI, Action, Dispatch } from "redux";
import { ChildPlugin } from "@kirby-web3/child-core";
import * as BurnerProvider from "burner-provider";
import { REQUEST_VIEW_ACTION } from "@kirby-web3/child-core/build/ViewPlugin";

import { ChildIFrameProvider } from "./ChildIFrameProvider";
import { SEND_TO_PARENT } from "@kirby-web3/common";

export interface EthereumChildPluginConfig {
  network: "mainnet" | "rinkeby" | "ropsten";
  rpcURL: string;
  burnerPreference: string;
  portis?: {
    appID: string;
  };
}

export class EthereumChildPlugin extends ChildPlugin<EthereumChildPluginConfig> {
  public name = "ethereum";
  public provider!: ChildIFrameProvider;
  public web3: typeof Web3;

  public async startup(): Promise<void> {
    this.provider = new ChildIFrameProvider(event => {
      this.dispatch({ type: SEND_TO_PARENT, payload: event });
    });
    await this.provider.initialize();
    this.web3 = new Web3(this.provider);

    const win = window as any;
    if (win.ethereum) {
      win.ethereum.autoRefreshOnNetworkChange = false;
    }
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
      if (this.config.burnerPreference === "always") {
        const burnerProvider = new BurnerProvider({
          rpcUrl: this.config.rpcURL, // oof I don't like the difference in caps here rpcUrl is the standard
          namespace: "someparentsite.com"
        });
        return this.activateWeb3(burnerProvider, "Burner Wallet", action.requestID)
      } else {
        console.log("ENABLE!!!!",this.config)
        this.dispatch({
          type: REQUEST_VIEW_ACTION,
          payload: { route: "/ethereum/web3enable", requestID: action.requestID },
        });
      }
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

  public async enableWeb3(providerType: string, requestID: string): Promise<void> {
    let concreteProvider;
    if (providerType === "MetaMask") {
      const win = window as any;
      if (win.ethereum) {
        await win.ethereum.enable();

        await this.provider.setConcreteProvider(win.ethereum);
        concreteProvider = win.ethereum;
      } else {
        throw new Error("no injected web3 provided");
      }
    } else if (providerType === "Portis") {
      const portis = new Portis(this.config.portis!.appID, this.config.network);
      concreteProvider = portis.provider;
    } else if (providerType === "Burner Wallet") {
      const burnerProvider = new BurnerProvider(this.config.rpcURL);
      concreteProvider = burnerProvider;
    } else {
      throw new Error("unrecognized provider");
    }

    await this.activateWeb3(concreteProvider, providerType, requestID);
  }

  public async activateWeb3(concreteProvider: any, providerType: string, requestID: string): Promise<void> {
    await this.provider.setConcreteProvider(concreteProvider);
    this.dispatch({
      type: "PARENT_RESPONSE",
      requestID,
      payload: { requestID, provider: providerType, requestType: "WEB3_ENABLE" },
    });
    const accounts = await this.web3.eth.getAccounts();
    this.dispatch({ type: SEND_TO_PARENT, payload: { type: "WEB3_ON_ACCOUNTSCHANGED", payload: accounts } });
  }
}
