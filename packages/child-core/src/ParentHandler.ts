import { MiddlewareAPI, Action, Dispatch } from "redux";
import {
  ChildToParentMessage,
  CHILD_RESPONSE,
  CHILD_SHOW_VIEW,
  CHILD_ALIVE,
  CHILD_HIDE_VIEW,
  SEND_TO_PARENT,
} from "@kirby-web3/common";
import { ChildPlugin } from "./ChildPlugin";
import { REQUEST_VIEW_ACTION, COMPLETE_VIEW_ACTION } from "./ViewPlugin";

export class ParentHandler extends ChildPlugin {
  public name = "iframe";
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

    this.sendToParent({ type: CHILD_ALIVE, payload: { provides: [] } });
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
      this.sendToParent({ type: CHILD_RESPONSE, requestID: action.requestID, payload: action.payload });
    } else if (action.type === REQUEST_VIEW_ACTION) {
      this.sendToParent({ type: CHILD_SHOW_VIEW, payload: {} });
    } else if (action.type === COMPLETE_VIEW_ACTION) {
      const queue = api.getState().view.queue;
      this.logger("should we hide the view?", api.getState().view);
      if (queue.length === 1) {
        this.sendToParent({ type: CHILD_HIDE_VIEW, payload: {} });
      }
    } else if (action.type === SEND_TO_PARENT) {
      console.log("SEND_TO_PARENT send to parent", action.payload);
      this.sendToParent(action.payload);
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

  public sendToParent(message: ChildToParentMessage): void {
    parent.postMessage(message, this.parentDomain);
  }
}
