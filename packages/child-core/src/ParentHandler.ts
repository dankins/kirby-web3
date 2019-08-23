import { MiddlewareAPI, Action, Dispatch } from "redux";
import { ChildPlugin } from "./ChildPlugin";

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

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    if (action.type === "PARENT_RESPONSE") {
      console.log("sending response to parent", action.requestID, action.payload);
      this.sendToParent(action.requestID, action.payload);
    }
    next(action);
  };

  public reducer(state: any = { pending: [] }, action: any): any {
    // this.logger("reduce", state, message);
    // return this.provider.handleIFrameMessage(message.request.data);
    this.logger("got an action", action);

    switch (action.type) {
      case "PARENT_REQUEST":
        return { ...state, pending: { ...state.pending, [action.requestID]: action } };
    }

    return state;
  }

  public sendToParent(requestID: number, data: any): void {
    parent.postMessage({ requestID, type: "RESPONSE", data }, "http://localhost:3001");
  }
}
