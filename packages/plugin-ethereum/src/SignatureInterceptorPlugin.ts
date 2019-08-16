import { ChildPlugin } from "@kirby-web3/child-core";
import { MiddlewareAPI, Action } from "redux";
import { Dispatch } from "react";
import { REQUEST_VIEW_ACTION } from "@kirby-web3/child-core/build/ViewPlugin";
import * as webUtils from "web3-utils";

export const SIGNATURE_INTERCEPTOR = "SIGNATURE_INTERCEPTOR";

export function isSignatureRequest(action: any): boolean {
  if (action.type === "PARENT_REQUEST" && action.data.type === "WEB3_REQUEST") {
    const request = action.data.data;
    return request.method === "send" && request.params[0].method === "personal_sign";
  }
  return false;
}

export interface SignatureInterceptorPluginConfig {
  autoSign: boolean;
}
export class SignatureInterceptorPlugin extends ChildPlugin<SignatureInterceptorPluginConfig> {
  public name = "signatureInterceptor";
  public dependsOn = ["ethereum"];

  public middleware = (api: MiddlewareAPI<any, any>) => (next: Dispatch<any>) => <A extends Action<any>>(
    action: any,
  ): void => {
    if (action.doNotIntercept || this.config.autoSign) {
      next(action);
    } else if (isSignatureRequest(action)) {
      this.dispatch({
        type: SIGNATURE_INTERCEPTOR,
        payload: { originalAction: { ...action, doNotIntercept: true } },
      });
      this.dispatch({
        type: REQUEST_VIEW_ACTION,
        payload: { route: "/ethereum/confirm-signature" },
      });
    } else {
      next(action);
    }
  };

  public getSignatureRequest(): any {
    const request = this.getState().signatureInterceptor.originalAction.data.data.params;

    const plaintext = webUtils.hexToUtf8(request[0].params[0]);
    return { plaintext, request };
  }

  public reducer(state: any = {}, action: any): any {
    if (action.type === SIGNATURE_INTERCEPTOR) {
      return { ...state, originalAction: action.payload.originalAction };
    }
    return state;
  }

  public approveAction() {
    const originalAction = this.getState().signatureInterceptor.originalAction;
    this.dispatch(originalAction);
  }

  public rejectAction() {
    const originalAction = this.getState().signatureInterceptor.originalAction;
    this.dispatch({ type: "REJECTED_REQUEST", payload: { originalAction: originalAction } });
  }
}
