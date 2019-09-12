import { Action, MiddlewareAPI, Dispatch } from "redux";
import { ParentPlugin, DMZ } from "@kirby-web3/parent-core";
import { EthereumParentPlugin } from "@kirby-web3/plugin-ethereum";
import { CONNEXT_OPEN_CHANNEL_REQUEST, CONNEXT_RESOLVE_PAYMENT_REQUEST } from "./ConnextChildPlugin";
import { ethers } from "ethers";

import {
  LinkPaymentRequest,
  LinkPaymentResolve,
  CONNEXT_CHANNEL_OPENED,
  CONNEXT_ADD_FUNDS_REQUEST,
  CONNEXT_SEND_PAYMENT_REQUEST,
  CONNEXT_FREE_BALANCE_REQUEST,
  CONNEXT_FREE_BALANCE_RESPONSE,
  EtherAddress,
} from "./common";
import { NodeChannel, LinkedTransferResponse } from "@connext/types";

export interface ConnextPluginState {
  channel?: NodeChannel;
  balances: {
    [token: string]: string[];
  };
}

export interface ConnextPaymentRequestAction {
  type: typeof CONNEXT_SEND_PAYMENT_REQUEST;
  payload: LinkPaymentRequest;
}

export interface ConnextAddFundsRequestAction {
  type: typeof CONNEXT_ADD_FUNDS_REQUEST;
}

export interface ConnextPaymentResolveAction {
  type: typeof CONNEXT_RESOLVE_PAYMENT_REQUEST;
  payload: LinkPaymentResolve;
}

export interface ChannelOpenedAction {
  type: typeof CONNEXT_CHANNEL_OPENED;
  payload: NodeChannel;
}
export interface FreeBalanceResponse {
  type: typeof CONNEXT_FREE_BALANCE_RESPONSE;
  payload: {
    [token: string]: string[];
  };
}

export type ConnextPluginActions =
  | ConnextPaymentRequestAction
  | ConnextAddFundsRequestAction
  | ChannelOpenedAction
  | FreeBalanceResponse;

export interface Config {
  readOnlyNodeURI: string;
}

export interface ParentDependencies {
  ethereum: EthereumParentPlugin;
  dmz: DMZ;
}

export class ConnextParentPlugin extends ParentPlugin<Config, ParentDependencies, ConnextPluginActions> {
  public name = "connext";
  public dependsOn = ["ethereum", "dmz"];
  public web3: any;
  public provider: any;

  public reducer(state: ConnextPluginState = { balances: {} }, action: any): any {
    if (action.type === CONNEXT_CHANNEL_OPENED) {
      return { ...state, channel: action.payload };
    } else if (action.type === CONNEXT_FREE_BALANCE_RESPONSE) {
      return { ...state, balances: { ...state.balances, [action.payload.token]: action.payload.balance } };
    }

    return state;
  }

  public async startup(): Promise<void> {
    this.logger(
      "!!!! WARNING !!!! THIS PLUGIN IS NOT FULLY BAKED AND MIGHT LOSE YOUR (RINKEBY) ETHER. PROCEED WITH CAUTION",
    );
  }

  public async openChannel(): Promise<void> {
    this.logger("opening a channel");
    const response = await this.dependencies.dmz.send({ type: CONNEXT_OPEN_CHANNEL_REQUEST, payload: {} });
    this.logger("opened channel:", response);
    this.dispatch({ type: CONNEXT_CHANNEL_OPENED, payload: response });
  }

  public async getFreeBalance(token?: string): Promise<any> {
    const response = await this.dependencies.dmz.send({
      type: CONNEXT_FREE_BALANCE_REQUEST,
      payload: token || EtherAddress,
    });
    this.logger("balance response:", response);
    this.dispatch({ type: CONNEXT_FREE_BALANCE_RESPONSE, payload: response });
    return response;
  }

  public async sendPaymentRequest(amountEther: string, comment?: string): Promise<LinkedTransferResponse> {
    const amountWei = ethers.utils.parseEther(amountEther);
    const action: ConnextPaymentRequestAction = {
      type: CONNEXT_SEND_PAYMENT_REQUEST,
      payload: { amountWei: amountWei.toHexString(), comment },
    };
    this.logger("sending a payment request", action);
    const response = await this.dependencies.dmz.send(action);
    this.logger("send payment response:", response);
    return response;
  }

  public async resolvePayment(
    recipient: string,
    amountEther: string,
    preImage: string,
    paymentID: string,
  ): Promise<void> {
    const amountWei = ethers.utils.parseEther(amountEther);
    const action: ConnextPaymentResolveAction = {
      type: CONNEXT_RESOLVE_PAYMENT_REQUEST,
      payload: { recipient, amountWei: amountWei.toHexString(), preImage, paymentID },
    };
    this.logger("sending a payment request", action);
    const response = await this.dependencies.dmz.send(action);
    this.logger("send payment response:", response);
  }

  public async addFunds(): Promise<LinkedTransferResponse> {
    const action: ConnextAddFundsRequestAction = {
      type: CONNEXT_ADD_FUNDS_REQUEST,
    };
    this.logger("sending add funds request", action);
    const response = await this.dependencies.dmz.send(action);
    this.logger("send payment response:", response);
    return response;
  }
}
