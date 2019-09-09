import { ethers } from "ethers";

// shared iframe types
export const EtherAddress = ethers.constants.AddressZero;

export const CONNEXT_ADD_FUNDS_REQUEST = "CONNEXT_ADD_FUNDS_REQUEST";
export const CONNEXT_CHANNEL_OPENED = "CONNEXT_CHANNEL_OPENED";
export const CONNEXT_SEND_PAYMENT_REQUEST = "CONNEXT_SEND_PAYMENT_REQUEST";
export const CONNEXT_FREE_BALANCE_REQUEST = "CONNEXT_FREE_BALANCE_REQUEST";
export const CONNEXT_FREE_BALANCE_RESPONSE = "CONNEXT_FREE_BALANCE_RESPONSE";

export interface LinkPaymentRequest {
  tokenAddress?: string;
  amountWei: string;
  comment?: string;
}

export interface LinkPaymentResolve {
  recipient: string;
  preImage: string;
  paymentID: string;
  amountWei: string;
  tokenAddress?: string;
}
