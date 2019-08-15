import { ParentPlugin } from "./ParentPlugin";
import { MiddlewareAPI, Action } from "redux";
import { Dispatch } from "react";

// redux action types
export const RECEIVED_CHILD_MESSAGE = "RECEIVED_CHILD_MESSAGE";
export const IFRAME_STATUS_CHANGE = "IFRAME_STATUS_CHANGE";
export enum IFrameStatus {
  LOADING = "LOADING",
  ERROR = "ERROR",
  HIDDEN = "HIDDEN",
  VISIBLE = "VISIBLE",
}

interface Subscribers {
  [key: string]: Array<{ resolve?: any; reject?: any; callback: (data: any) => void }>;
}

export interface ReceivedChildMessage {
  type: typeof RECEIVED_CHILD_MESSAGE;
  payload: {
    requestID: number;
    type: string;
    data: any; // TOOD(dankins): change this to payload to match?
  };
}

export interface IFrameStatusChange {
  type: typeof IFRAME_STATUS_CHANGE;
  payload: IFrameStatus;
}

export type DMZMessageType = ReceivedChildMessage | IFrameStatusChange;

export interface DMZConfig {
  targetOrigin: string;
  iframeSrc: string;
}

let requestID = 0;
function generateRequestID(): number {
  return requestID + 1;
}

export class DMZ extends ParentPlugin<DMZConfig, any, DMZMessageType> {
  public name = "dmz";
  private iframe?: Window;
  private iframeElement!: HTMLIFrameElement;
  private subscribers: Subscribers = { READY: [] };

  public async startup(): Promise<void> {
    this.dispatch({ type: IFRAME_STATUS_CHANGE, payload: IFrameStatus.LOADING });
    const body = document.getElementsByTagName("BODY")[0];
    const iframe = document.createElement("iframe");
    this.iframeElement = iframe;
    iframe.src = this.config.iframeSrc;
    this.hideChild();

    iframe.onload = () => {
      const contentWindow = (iframe as HTMLIFrameElement).contentWindow;
      this.iframe = contentWindow!;
      this.dispatch({ type: IFRAME_STATUS_CHANGE, payload: IFrameStatus.HIDDEN });
    };

    iframe.onerror = () => {
      // pretty sure this will never fire do to cross site origin restrictions
      console.error("FAILED TO LOAD IFRAME!");
      this.dispatch({ type: IFRAME_STATUS_CHANGE, payload: IFrameStatus.ERROR });
    };

    if (window.addEventListener) {
      window.addEventListener("message", this.handleMessage.bind(this));
    } else {
      (window as any).attachEvent("onmessage", this.handleMessage.bind(this));
    }

    body.appendChild(iframe);
  }

  public reducer(state: any = {}, action: DMZMessageType) {
    if (action.type === IFRAME_STATUS_CHANGE) {
      return { ...state, status: action.payload };
    }
    return state;
  }

  public middleware = (api: MiddlewareAPI<any, any>) => (next: Dispatch<any>) => <A extends Action<any>>(
    action: any,
  ): void => {
    if (action.type === RECEIVED_CHILD_MESSAGE) {
      const message = (action as ReceivedChildMessage).payload;
      const requestID = message.requestID;
      const subscriber = this.subscribers[requestID];
      this.logger("received a child message", requestID, subscriber);
      subscriber.map(async (sub, idx) => {
        try {
          const result = await sub.callback(message.data);
          sub.resolve ? sub.resolve(result) : undefined;
          delete subscriber[idx];
        } catch (err) {
          console.error("error", err);
          sub.reject(err);
        }
      });
      delete this.subscribers[requestID];

      // this.sendToParent(action.requestID, {});
    }
    next(action);
  };

  public async showChild(): Promise<any> {
    const style = `
    border: none; 
    position: absolute; 
    top: 0px; 
    right: 0px;
    width: 100%;
    height: 100%;
    `;
    this.iframeElement.setAttribute("style", style);
    this.dispatch({ type: IFRAME_STATUS_CHANGE, payload: IFrameStatus.VISIBLE });
  }
  public async hideChild(): Promise<any> {
    this.iframeElement.setAttribute("style", "display: none");
    this.dispatch({ type: IFRAME_STATUS_CHANGE, payload: IFrameStatus.HIDDEN });
  }
  public async send(message: any): Promise<any> {
    if (!this.iframe) {
      this.logger("not ready to send");
      return Promise.reject("not ready to send - iframe not available yet");
    }
    const requestID = generateRequestID();
    this.logger(`SEND ${message.type}`, this.iframe);
    this.iframe!.postMessage({ requestID, request: message }, this.config.targetOrigin);
    return this.waitForResponse(requestID, response => {
      this.logger(`RESPONSE`, requestID, response);
      return response;
    });
  }

  public async waitForChildInteraction(message: any): Promise<any> {
    this.showChild();
    try {
      const response = await this.send(message);
      this.hideChild();
      return response;
    } catch (err) {
      console.log("error waiting for iframe interaction");
      this.hideChild();
    }
  }

  public waitForResponse(requestID: number, callback: (data?: any) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.subscribers[requestID]) {
        this.subscribers[requestID] = [];
      }

      this.subscribers[requestID].push({ resolve, reject, callback });
    });
  }

  public listen(message: string, callback: (data?: any) => void): void {
    if (!this.subscribers[message]) {
      this.subscribers[message] = [];
    }

    this.subscribers[message].push({ callback });
  }

  private handleMessage(message: any): void {
    if (message.origin === this.config.targetOrigin) {
      this.dispatch({
        type: RECEIVED_CHILD_MESSAGE,
        payload: message.data,
      });
    }
  }
}
