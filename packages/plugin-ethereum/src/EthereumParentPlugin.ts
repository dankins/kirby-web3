import { ParentIFrameProvider } from "./ParentIFrameProvider";
import { Action, MiddlewareAPI, Dispatch } from "redux";
import { ParentPlugin, DMZ, MESSAGE_FROM_CHILD } from "@kirby-web3/parent-core";

// web3.js hates typescript *eyeroll*
import WebWsProvider = require("web3-providers-ws");
import Web3HttpProvider = require("web3-providers-http");
import Web3 = require("web3");

// EthereumPlugin action types
export const ETHEREUM_NEW_WEB3_INSTANCE = "ETHEREUM_NEW_WEB3_INSTANCE";
export const ETHEREUM_ACCOUNT_CHANGE = "ETHEREUM_ACCOUNT_CHANGE";
export const ETHEREUM_WEB3_CHANGE_ACCOUNT = "ETHEREUM_WEB3_CHANGE_ACCOUNT";

export interface EthereumPluginState {
  readonly: boolean;
  account?: string;
}

export interface NewWeb3Instance {
  type: typeof ETHEREUM_NEW_WEB3_INSTANCE;
  payload: {
    providerType: string;
  };
}

export interface AccountChange {
  type: typeof ETHEREUM_ACCOUNT_CHANGE;
  payload: {
    accounts: string[];
  };
}

export interface ChangeAccount {
  type: typeof ETHEREUM_WEB3_CHANGE_ACCOUNT;
}

export type EthereumPluginActions = NewWeb3Instance | AccountChange | ChangeAccount;

export interface Config {
  readOnlyNodeURI: string;
}

export interface Dependencies {
  dmz: DMZ;
}

export class EthereumParentPlugin extends ParentPlugin<Config, Dependencies, EthereumPluginActions> {
  public name = "ethereum";
  public dependsOn = ["dmz"];
  public web3: any;
  public provider: any;

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    if (action.type === MESSAGE_FROM_CHILD) {
      const message = action.payload;
      if (message.payload.requestType === "WEB3_ENABLE") {
        this.dispatch({ type: ETHEREUM_NEW_WEB3_INSTANCE, payload: { providerType: action.payload.providerType } });
      } else if (message.type === "WEB3_ON_ACCOUNTSCHANGED") {
        this.logger("setting web3 default account", message.payload[0]);
        this.web3.defaultAccount = message.payload[0];
      }
    }
    next(action);
  };

  public reducer(state: EthereumPluginState = { readonly: true }, action: any): any {
    if (action.type === ETHEREUM_NEW_WEB3_INSTANCE) {
      return { ...state, readonly: false };
    } else if (action.type === MESSAGE_FROM_CHILD) {
      const message = action.payload;
      if (message.type === "WEB3_ON_ACCOUNTSCHANGED") {
        return { ...state, account: message.payload[0] };
      }
    }
    return state;
  }

  public async changeAccount(): Promise<void> {
    const action: EthereumPluginActions = {
      type: ETHEREUM_WEB3_CHANGE_ACCOUNT,
    };
    this.logger("sending request to change account", action);
    const response = await this.dependencies.dmz.send(action);
    this.logger("send change account response:", response);
  }

  public async startup(): Promise<void> {
    if ((window as any).ethereum) {
      (window as any).ethereum.autoRefreshOnNetworkChange = false;
    }
    this.provider = new ParentIFrameProvider(this.dependencies.dmz);
    this.web3 = new Web3(this.provider);
  }

  public async requestSignerWeb3(): Promise<void> {
    await this.provider.enable();
    await this.getAccounts();
  }

  public async getAccounts(): Promise<string[]> {
    const accounts = await this.web3.eth.getAccounts();

    this.dispatch({ type: ETHEREUM_ACCOUNT_CHANGE, payload: { accounts } });
    return accounts;
  }
}
