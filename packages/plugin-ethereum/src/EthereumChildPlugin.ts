import * as Portis from "@portis/web3";
import { MiddlewareAPI, Action, Dispatch } from "redux";
import * as BurnerProvider from "burner-provider";

import { ChildPlugin, REQUEST_VIEW_ACTION } from "@kirby-web3/child-core";
import { SEND_TO_PARENT } from "@kirby-web3/common";

import { ChildIFrameProvider } from "./ChildIFrameProvider";
import Web3 = require("web3");
import {
  ETHEREUM_WEB3_CHANGE_ACCOUNT,
  ETHEREUM_WEB3_CHANGE_NETWORK,
  ProviderTypes,
  Network,
  IDToNetwork,
} from "./common";

export interface EthereumChildPluginState {
  providerType?: string;
  network?: Network;
}

export interface EthereumChildPluginConfig {
  defaultNetwork: Network;
  networks: {
    [key in Network]?: string;
  };
  burnerPreference: string;
  portis?: {
    appID: string;
  };
}

export class EthereumChildPlugin extends ChildPlugin<EthereumChildPluginConfig> {
  public name = "ethereum";
  public provider!: ChildIFrameProvider;
  public web3: typeof Web3;
  public dependsOn = ["iframe"];

  public async startup(): Promise<void> {
    this.provider = new ChildIFrameProvider(event => {
      this.dispatch({ type: SEND_TO_PARENT, payload: event });
    });

    const rpcUrl = this.config.networks[this.config.defaultNetwork];
    if (!rpcUrl) {
      throw new Error(
        "could not start EthereumChildPlugin since there is no RPC URL defined for the default network (this.config.networks[this.config.defaultNetwork])",
      );
    }

    await this.provider.initialize(rpcUrl);
    this.web3 = new Web3(this.provider);
    if (window) {
      const win = window as any;
      if (win.ethereum) {
        win.ethereum.autoRefreshOnNetworkChange = false;
      }
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
        const rpcUrl = this.config.networks[this.config.defaultNetwork];
        if (!rpcUrl) {
          console.error(rpcUrl, this.config.networks, this.config.defaultNetwork);
          throw new Error(
            "could not start Burner Provider since there is no RPC URL defined for the default network (this.config.networks[this.config.defaultNetwork])",
          );
        }

        const burnerProvider = new BurnerProvider({
          rpcUrl,
          namespace: this.dependencies.iframe.parentDomain,
        });
        this.activateWeb3(burnerProvider, "Burner Wallet", action.requestID).catch(err => {
          console.log("unable to activate web3:", err);
        });
      } else {
        this.dispatch({
          type: REQUEST_VIEW_ACTION,
          payload: {
            route: "/ethereum/web3enable/" + this.config.defaultNetwork,
            requestID: action.requestID,
          },
        });
      }
      return;
    } else if (action.type === "PARENT_REQUEST" && action.data.type === ETHEREUM_WEB3_CHANGE_ACCOUNT) {
      this.dispatch({
        type: REQUEST_VIEW_ACTION,
        payload: {
          route: "/ethereum/web3enable/" + api.getState().ethereum.network,
          requestID: action.requestID,
        },
      });
      return;
    } else if (action.type === "PARENT_REQUEST" && action.data.type === ETHEREUM_WEB3_CHANGE_NETWORK) {
      this.changeNetwork(action.requestID, action.data.payload, api.getState().ethereum).catch(err => {
        console.error("unable to change network: ", err);
      });
      return;
    }
    next(action);
  };

  public reducer(state: EthereumChildPluginState = {}, action: any): any {
    if (action.type === "PARENT_RESPONSE" && action.payload && action.payload.requestType === "WEB3_ENABLE") {
      return { ...state, ...action.payload };
    }
    return state;
  }

  public async enableWeb3(requestID: number, providerType: string, network: Network): Promise<void> {
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
    } else if (providerType === ProviderTypes.PORTIS) {
      const portis = new Portis(this.config.portis!.appID, network);
      concreteProvider = portis.provider;
    } else if (providerType === ProviderTypes.BURNER) {
      const rpcUrl = this.config.networks[network];
      if (!rpcUrl) {
        throw new Error("could not build Burner Provider since there is no RPC URL defined for the network " + network);
      }

      const burnerProvider = new BurnerProvider({ rpcUrl, namespace: this.dependencies.iframe.parentDomain });
      concreteProvider = burnerProvider;
    } else {
      throw new Error("unrecognized provider: " + providerType);
    }

    await this.activateWeb3(concreteProvider, providerType, requestID);
  }

  public async changeNetwork(requestID: number, network: Network, state: any): Promise<void> {
    if (state.network !== network) {
      await this.enableWeb3(requestID, state.providerType, network);
    } else {
      this.logger("do not need to change network");
      this.dispatch({ type: "PARENT_RESPONSE", requestID, payload: network });
    }
  }

  public async activateWeb3(concreteProvider: any, providerType: string, requestID: number): Promise<void> {
    await this.provider.setConcreteProvider(concreteProvider);
    //
    const accounts = await this.web3.eth.getAccounts();
    const networkID: number = await this.web3.eth.net.getId();
    const network = IDToNetwork[networkID];
    this.dispatch({
      type: "PARENT_RESPONSE",
      requestID,
      payload: { providerType, network, requestType: "WEB3_ENABLE" },
    });
    this.dispatch({ type: SEND_TO_PARENT, payload: { type: "WEB3_ON_NETWORKCHANGED", payload: networkID } });
    this.dispatch({ type: SEND_TO_PARENT, payload: { type: "WEB3_ON_ACCOUNTSCHANGED", payload: accounts } });
  }
}
