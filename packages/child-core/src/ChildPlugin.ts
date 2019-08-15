import { Plugin } from "@kirby-web3/common";
import { AnyAction } from "redux";

export abstract class ChildPlugin<C = undefined, D = any, A extends AnyAction = any> extends Plugin<C, D, A> {
  public sendToParent(requestID: number, data: any): void {
    parent.postMessage({ requestID: requestID, type: "RESPONSE", data }, "http://localhost:3001");
  }
}
