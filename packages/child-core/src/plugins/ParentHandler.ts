import { MiddlewareAPI, Action } from "redux";
import { Dispatch } from "react";
import { ChildPlugin } from "../ChildPlugin";

export class ParentHandler extends ChildPlugin {
  public name = "parent";
  public parentDomain: string;

  public constructor() {
    super();
    let parentDomain: string;
    const parentURL = window.location !== window.parent.location ? document.referrer : document.location.href;
    if (parentURL) {
      const match = parentURL.match(/(.*):\/\/(.[^/]+)/);
      if (match) {
        parentDomain = match[0];
        this.parentDomain = parentDomain;
      } else {
        throw new Error("could  determine parentDomain");
      }
    } else {
      throw new Error("could  determine parentDomain");
    }

    if (window.addEventListener) {
      window.addEventListener("message", this.handleMessage.bind(this));
    } else {
      (window as any).attachEvent("onmessage", this.handleMessage.bind(this));
    }
  }

  public async handleMessage(message: any): Promise<void> {
    if (message.origin === this.parentDomain) {
      if (message.data.requestID) {
        this.dispatch({
          type: "PARENT_REQUEST",
          requestID: message.data.requestID,
          data: message.data.request,
        });
      }
    }
  }

  public middleware = (api: MiddlewareAPI<any, any>) => (next: Dispatch<any>) => <A extends Action<any>>(
    action: any,
  ): void => {
    if (action.type === "PARENT_RESPONSE") {
      console.log("sending response to parent", action, api.getState());
      this.sendToParent(action.requestID, {});
    }
    next(action);
  };

  public reducer(state: any = { pending: [] }, message: any): any {
    // this.logger("reduce", state, message);
    // return this.provider.handleIFrameMessage(message.request.data);
    this.logger("got a message", message);

    switch (message.type) {
      case "PARENT_REQUEST":
        return { ...state, pending: { ...state.pending, [message.requestID]: message } };
    }

    return state;
  }
}
