import { Action, MiddlewareAPI, Dispatch } from "redux";
import { ChildPlugin, ParentHandlerActions, PARENT_REQUEST, ParentHandler } from "@kirby-web3/child-core";
import { EthereumChildPlugin } from "@kirby-web3/plugin-ethereum";
import * as connext from "@connext/client";
import { Wallet, ethers } from "ethers";

import { store } from "./store";
import {
  LinkPaymentRequest,
  LinkPaymentResolve,
  CONNEXT_CHANNEL_OPENED,
  CONNEXT_SEND_PAYMENT_REQUEST,
  CONNEXT_FREE_BALANCE_REQUEST,
  CONNEXT_ADD_FUNDS_REQUEST,
} from "./common";
import { NodeChannel, ChannelState, LinkedTransferResponse } from "@connext/types";

// action types
export const CHILD_CONNEXT_SEND_PAYMENT = "CONNEXT_SEND_PAYMENT";
export const CONNEXT_OPEN_CHANNEL_REQUEST = "CONNEXT_OPEN_CHANNEL_REQUEST";
export const CONNEXT_RESOLVE_PAYMENT_REQUEST = "CONNEXT_RESOLVE_PAYMENT_REQUEST";

// state
export interface ChildPluginState {
  channel?: ChannelState;
}

// actions
export interface ChildSendConnextPayment {
  type: typeof CHILD_CONNEXT_SEND_PAYMENT;
  payload: {
    amountWei: string;
  };
}

export interface ConnextChannelOpenedAction {
  type: typeof CONNEXT_CHANNEL_OPENED;
  payload: NodeChannel;
}

// action union type
export type ChildPluginActions = ChildSendConnextPayment | ConnextChannelOpenedAction | ParentHandlerActions;

export interface ChildConfig {
  ethProviderUrl: string;
  nodeUrl: string;
}

export interface ChildDependencies {
  ethereum: EthereumChildPlugin;
  iframe: ParentHandler;
}

export class ConnextChildPlugin extends ChildPlugin<ChildConfig, ChildDependencies, ChildPluginActions> {
  public name = "connext";
  public dependsOn = ["ethereum", "iframe"];
  public channel?: connext.ConnextInternal;

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    if (action.type === PARENT_REQUEST) {
      switch (action.data.type) {
        case CONNEXT_OPEN_CHANNEL_REQUEST:
          this.handleResult(this.openChannel(), action.requestID);
          break;
        case CONNEXT_SEND_PAYMENT_REQUEST:
          this.handleResult(this.linkPayment(action.data.payload), action.requestID);
          break;
        case CONNEXT_RESOLVE_PAYMENT_REQUEST:
          this.handleResult(this.resolveLinkPayment(action.data.payload), action.requestID);
          break;
        case CONNEXT_FREE_BALANCE_REQUEST:
          this.handleResult(this.getFreeBalance(action.data.payload), action.requestID);
          break;
        case CONNEXT_ADD_FUNDS_REQUEST:
          this.handleResult(this.deposit("0.001"), action.requestID);
          break;
        default:
          next(action);
      }
    } else {
      next(action);
    }
  };

  public reducer(state: ChildPluginState = {}, action: any): any {
    if (action.type === CONNEXT_CHANNEL_OPENED) {
      return { ...state, channel: action.payload };
    }
    return state;
  }

  public async startup(): Promise<void> {
    this.logger("starting up");
  }

  public getMnemonic(): string {
    const CONNEXT_MNEMONIC = "CONNEXT_MNEMONIC";
    let mnemonic = localStorage.getItem(CONNEXT_MNEMONIC);

    if (!mnemonic) {
      const wallet = Wallet.createRandom();
      mnemonic = wallet.mnemonic;
      localStorage.setItem(CONNEXT_MNEMONIC, mnemonic);
    }

    return mnemonic;
  }

  public async openChannel(): Promise<NodeChannel> {
    // @ts-ignore types want me to have store and mnemonic, but thats a lie
    const channel = await connext.connect({
      mnemonic: this.getMnemonic(),
      ethProviderUrl: this.config.ethProviderUrl,
      nodeUrl: this.config.nodeUrl,
      // @ts-ignore types are wonky
      store,
    });
    this.channel = channel;

    const state: NodeChannel = await channel.getChannel();
    this.logger("channel opened", state);
    this.dispatch({ type: CONNEXT_CHANNEL_OPENED, payload: state });

    const etherBalance = await this.getFreeBalance();
    this.logger(
      "balance:",
      etherBalance,
      Object.keys(etherBalance).map(k => {
        return `${k} -> ${etherBalance[k].toString()}`;
      }),
    );

    // this.logger("starting deposit");
    // await this.deposit("0.1");

    return state;
  }

  public async getFreeBalance(token?: string): Promise<any> {
    if (!this.channel) {
      throw new Error("channel not open");
    }

    const result = await this.channel.getFreeBalance(token || ethers.constants.AddressZero);

    return { token: token || ethers.constants.AddressZero, balance: result };
  }

  public async deposit(amount: string): Promise<any> {
    if (!this.channel) {
      throw new Error("channel not open");
    }
    const payload = {
      amount: ethers.utils.parseEther(amount).toHexString(), // represented as bignumber
      assetId: ethers.constants.AddressZero, // Use the AddressZero constant from ethers.js to represent ETH, or enter the token address
    };

    this.logger("depositing", payload);
    // funds should be in the account "cf module signer address"
    const result = await this.channel.deposit(payload);
    this.logger("deposit result", result);

    return { status: "ok" };
  }

  public async transfer(requestID: number, recipient: string, amountWei: string, comment?: string): Promise<void> {
    if (!this.channel) {
      throw new Error("channel not open");
    }

    const payload = {
      recipient, // counterparty's xPub
      meta: comment,
      amount: amountWei, // in Wei, represented as bignumber
      assetId: ethers.constants.AddressZero, // represents ETH
    };

    const result = await this.channel.transfer(payload);
    this.logger("transfer result:", result);
    this.dependencies.iframe.respond(requestID, result);
  }

  public async linkPayment(request: LinkPaymentRequest): Promise<LinkedTransferResponse> {
    if (!this.channel) {
      throw new Error("channel not open");
    }

    const link = await this.channel.conditionalTransfer({
      assetId: request.tokenAddress || ethers.constants.AddressZero,
      amount: request.amountWei,
      conditionType: "LINKED_TRANSFER",
      paymentId: connext.utils.createPaymentId(),
      preImage: connext.utils.createPreImage(),
    });

    this.logger("link result:", link);
    return link;
  }

  public async resolveLinkPayment(resolve: LinkPaymentResolve): Promise<void> {
    if (!this.channel) {
      throw new Error("channel not open");
    }

    const result = await this.channel.resolveCondition({
      amount: resolve.amountWei,
      assetId: resolve.tokenAddress || ethers.constants.AddressZero,
      conditionType: "LINKED_TRANSFER",
      paymentId: resolve.paymentID,
      preImage: resolve.preImage,
    });

    this.logger("payment resolve result", result);
  }

  private handleResult(promise: Promise<any>, requestID: number): void {
    promise
      .then(response => {
        this.dependencies.iframe.respond(requestID, response);
      })
      .catch(err => {
        console.error("error openChannel:", err);
      });
  }
}
