import { ParentPlugin } from "./ParentPlugin";
import { MiddlewareAPI, Action, Dispatch } from "redux";
import {
  CHILD_SHOW_VIEW,
  ChildToParentMessage,
  CHILD_RESPONSE,
  CHILD_HIDE_VIEW,
  PARENT_OUTSIDE_CLICK,
  CHILD_REJECT_REQUEST,
} from "@kirby-web3/common";

// redux action types
export const MESSAGE_FROM_CHILD = "MESSAGE_FROM_CHILD";
export const IFRAME_STATUS_CHANGE = "IFRAME_STATUS_CHANGE";
export enum IFrameStatus {
  LOADING = "LOADING",
  ERROR = "ERROR",
  READY = "READY",
}

interface Subscribers {
  [key: string]: Array<{ resolve?: any; reject?: any; callback(data: any): void }>;
}

export interface ReceivedChildMessage {
  type: typeof MESSAGE_FROM_CHILD;
  payload: ChildToParentMessage;
}

export interface IFrameStatusChange {
  type: typeof IFRAME_STATUS_CHANGE;
  payload: IFrameStatus;
}

export type DMZMessageType = ReceivedChildMessage | IFrameStatusChange;

export interface DMZConfig {
  targetOrigin: string;
  iframeSrc: string;
  iframeStyleOveride: string;
}

export class DMZ extends ParentPlugin<DMZConfig, any, DMZMessageType> {
  public name = "dmz";
  private iframe?: Window;
  private iframeElement!: HTMLIFrameElement;
  private subscribers: Subscribers = { READY: [] };
  private nextRequestID = 0;
  private startQueue: any[] = [];

  public async startup(): Promise<void> {
    const styleElem = document.createElement("style");
    styleElem.innerHTML =
      this.config.iframeStyleOveride ||
      `
      .kirby {
        display: none;
      }
      .kirby.kirby__visible {
        display: block;
        border: none;
        position: fixed;
        top: 0px;
        z-index: 10000000;
      }

      @media (min-width: 600px) {
        .kirby.kirby__visible {
          right: 0px;
          width: 410px;
          height: 1000px;
        }
      }

      @media (max-width: 600px) {
        .kirby.kirby__visible {
          left: 0px;
          width: 100%;
          height: 100%;
        }

      }
    `;
    document.getElementsByTagName("head")[0].appendChild(styleElem);

    this.dispatch({ type: IFRAME_STATUS_CHANGE, payload: IFrameStatus.LOADING });
    const body = document.getElementsByTagName("BODY")[0];
    const iframe = document.createElement("iframe");
    this.iframeElement = iframe;
    iframe.src = this.config.iframeSrc;
    iframe.classList.add("kirby");
    this.setupClickListener();

    this.hideChild();

    iframe.onload = () => {
      this.logger("iframe loaded");
      const contentWindow = (iframe as HTMLIFrameElement).contentWindow;
      this.iframe = contentWindow!;
      this.dispatch({ type: IFRAME_STATUS_CHANGE, payload: IFrameStatus.READY });
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

  public reducer(state: any = {}, action: DMZMessageType): any {
    if (action.type === IFRAME_STATUS_CHANGE) {
      return { ...state, status: action.payload };
    }
    return state;
  }

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    if (action.type === MESSAGE_FROM_CHILD) {
      const message = action.payload as ChildToParentMessage;
      this.logger("received message from child", message);
      switch (message.type) {
        case CHILD_RESPONSE: {
          this.logger("CHILD_RESPONSE", message);
          const subscriber = this.subscribers[message.requestID];
          subscriber.map(async (sub, idx) => {
            try {
              const result = sub.callback(message.payload);

              if (sub.resolve) {
                sub.resolve(result);
              }

              delete subscriber[idx];
            } catch (err) {
              console.error("error", err);
              sub.reject(err);
            }
          });
          delete this.subscribers[message.requestID];
          break;
        }
        case CHILD_REJECT_REQUEST:
          this.logger("CHILD_REJECT_REQUEST", message);
          const subscriber1 = this.subscribers[message.requestID];
          subscriber1.map(async (sub, idx) => {
            try {
              const result = sub.callback(message.payload);
              if (sub.reject) {
                sub.reject(result);
              }
              delete subscriber1[idx];
            } catch (err) {
              console.error("error", err);
              sub.reject(err);
            }
          });
          delete this.subscribers[message.requestID];
          break;
        case CHILD_SHOW_VIEW: {
          this.showChild(message.payload);
          break;
        }
        case CHILD_HIDE_VIEW: {
          this.hideChild();
          break;
        }
      }

      const subscribers = this.subscribers[message.type];
      this.logger("subscribers: ", message.type, subscribers);
      if (subscribers && subscribers.length > 0) {
        subscribers.map(cb => cb.callback(message.payload));
      }
    } else if (action.type === IFRAME_STATUS_CHANGE && action.payload === IFrameStatus.READY) {
      if (this.startQueue.length > 0) {
        this.logger("sending queued messages");
        this.startQueue.map(msg => this.iframe!.postMessage(msg, this.config.targetOrigin));
      }
    }
    next(action);
  };

  public showChild(request: any): void {
    this.iframeElement.classList.add("kirby__visible");
  }
  public hideChild(): void {
    this.iframeElement.classList.remove("kirby__visible");
  }

  public sendAsync(message: any, requestID?: number): void {
    const msg: any = { kirby: "parent", request: message };
    if (requestID) {
      msg.requestID = requestID;
    }
    if (!this.iframe) {
      this.startQueue.push(msg);
    } else {
      this.logger(`sending message to child iframe`, msg);
      console.log("send it ", msg);
      this.iframe!.postMessage(msg, this.config.targetOrigin);
    }
  }

  public async send(message: any): Promise<any> {
    const requestID = this.generateRequestID();
    this.sendAsync(message, requestID);

    return this.waitForResponse(requestID, response => {
      this.logger(`received response from child iframe`, requestID, response);
      return response;
    });
  }

  public async waitForChildInteraction(message: any): Promise<any> {
    try {
      const response = await this.send(message);
      return response;
    } catch (err) {
      console.log("error waiting for iframe interaction", err);
    }
  }

  public async waitForResponse(requestID: number, callback: (data?: any) => void): Promise<void> {
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
    if (message.origin === this.config.targetOrigin && message.data && message.data.kirby === "child") {
      this.dispatch({
        type: MESSAGE_FROM_CHILD,
        payload: message.data,
      });
    }
  }

  private generateRequestID(): number {
    this.nextRequestID++;
    return this.nextRequestID;
  }

  private setupClickListener(): void {
    const outsideClickListener = (event: any) => {
      if (this.iframeElement.contains(event.target)) {
        return;
      }

      if (this.iframeElement.classList.contains("kirby__visible")) {
        this.logger("received click outside of child");
        this.iframe!.postMessage(
          { kirby: "parent", request: { type: PARENT_OUTSIDE_CLICK } },
          this.config.targetOrigin,
        );
      }
    };
    document.addEventListener("click", outsideClickListener);
  }
}
