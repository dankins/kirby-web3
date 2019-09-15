import { ChildPlugin, REQUEST_VIEW_ACTION, ViewPlugin } from "@kirby-web3/child-core";
import { MiddlewareAPI, Action, Dispatch } from "redux";
import * as webUtils from "web3-utils";

export const SIGNATURE_INTERCEPTOR = "SIGNATURE_INTERCEPTOR";
export const SIGNATURE_INTERCEPTOR_CONFIRM = "SIGNATURE_INTERCEPTOR_CONFIRM";
export const SIGNATURE_INTERCEPTOR_REJECT = "SIGNATURE_INTERCEPTOR_REJECT";

export function isSignatureRequest(action: any): boolean {
  if (action.type === "PARENT_REQUEST" && action.data.type === "WEB3_REQUEST") {
    const request = action.data.data;
    return request.method === "send" && request.params[0].method === "personal_sign";
  }
  return false;
}

export interface SignatureInterceptorPluginState {
  requests: Array<{
    originalAction: any;
    hex: string;
    plainnet: string;
  }>;
  inFlightRequestID?: number;
}

export interface SignatureInterceptorPluginConfig {
  autoSign: boolean;
}
export class SignatureInterceptorPlugin extends ChildPlugin<SignatureInterceptorPluginConfig> {
  public name = "signatureInterceptor";
  public dependsOn = ["ethereum", "view"];

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    const inFlightRequestID = api.getState().signatureInterceptor.inFlightRequestID;

    // check if this is the "in-flight" request
    if (inFlightRequestID && action.requestID === inFlightRequestID) {
      next(action);
      if (action.type === "PARENT_RESPONSE") {
        (this.dependencies.view as ViewPlugin).completeView();
      }
    } else if (isSignatureRequest(action)) {
      // don't intercept if we should autosign
      if (this.config.autoSign) {
        next(action);
        return;
      }
      const hex = action.data.data.params[0].params[0];
      const plaintext = webUtils.hexToUtf8(hex);
      const request = { hex, plaintext, originalAction: action };
      this.dispatch({
        type: SIGNATURE_INTERCEPTOR,
        payload: request,
      });
      (this.dependencies.view as ViewPlugin).requestView("/ethereum/confirm-signature");
    } else {
      next(action);
    }
  };

  public reducer(state: SignatureInterceptorPluginState = { requests: [] }, action: any): any {
    if (action.type === SIGNATURE_INTERCEPTOR) {
      return { ...state, requests: [...state.requests, action.payload] };
    } else if (action.type === SIGNATURE_INTERCEPTOR_CONFIRM) {
      const [current, ...next] = state.requests;
      return { ...state, requests: next, inFlightRequestID: current.originalAction.requestID };
    } else if (action.type === SIGNATURE_INTERCEPTOR_REJECT) {
      const [, ...next] = state.requests;
      return { ...state, requests: next };
    }
    return state;
  }

  public approveAction(): void {
    const request = this.getState().signatureInterceptor.requests[0];
    this.dispatch({ type: SIGNATURE_INTERCEPTOR_CONFIRM, payload: request.requestID });
    this.dispatch(request.originalAction);
  }

  public rejectAction(): void {
    const request = this.getState().signatureInterceptor.requests[0];
    this.dispatch({ type: "PARENT_RESPONSE", requestID: request.requestID, payload: { status: "rejected" } });
    this.dispatch({ type: SIGNATURE_INTERCEPTOR_REJECT, payload: request.requestID });
    (this.dependencies.view as ViewPlugin).completeView();
  }
}
