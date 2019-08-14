// import { SDKMessage } from "@web3frame/core-messages";
import debug from "debug";

interface Subscribers {
  [key: string]: Array<{ resolve?: any; reject?: any; callback: (data: any) => void }>;
}

export interface DMZConfig {
  targetOrigin: string;
  iframeSrc: string;
}

let requestID = 0;
function generateRequestID(): number {
  return requestID + 1;
}

export class DMZ {
  private logger = debug("kirby:parent:dmz");
  private config!: DMZConfig;
  private iframe?: Window;
  private iframeElement!: HTMLIFrameElement;
  private subscribers: Subscribers = { READY: [] };

  public constructor() {}

  public async initialize(config: DMZConfig): Promise<void> {
    const body = document.getElementsByTagName("BODY")[0];
    const iframe = document.createElement("iframe");
    this.iframeElement = iframe;
    this.config = config;
    iframe.src = this.config.iframeSrc;
    this.hideChild();

    iframe.onload = () => {
      const contentWindow = (iframe as HTMLIFrameElement).contentWindow;
      this.iframe = contentWindow!;
    };

    iframe.onerror = () => {
      // pretty sure this will never fire do to cross site origin restrictions
      console.error("FAILED TO LOAD IFRAME!");
    };

    if (window.addEventListener) {
      const subs = this.subscribers;
      const targetOrigin = this.config.targetOrigin;
      window.addEventListener("message", function waitForAlive(message: any): void {
        if (message.origin === targetOrigin && message.data.type && message.data.type === "ALIVE") {
          subs.READY.map(cb => cb.callback({ callback: () => {} }));
          window.addEventListener("message", waitForAlive);
        }
      });

      window.addEventListener("message", this.handleMessage.bind(this));
    } else {
      (window as any).attachEvent("onmessage", this.handleMessage.bind(this));
    }

    body.appendChild(iframe);
  }

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
  }
  public async hideChild(): Promise<any> {
    this.iframeElement.setAttribute("style", "display: none");
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

  // public addOnloadHandler(f: () => void): void {
  //   this.subscribers.READY.push(f);
  // }

  public waitForResponse(requestID: number, callback: (data?: any) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.subscribers[requestID]) {
        this.subscribers[requestID] = [];
      }

      this.subscribers[requestID].push({ resolve, reject, callback });
    });
  }

  public listen(message: string, callback: (data?: any) => void): void {
    // console.log("listen:", message, callback);
    if (!this.subscribers[message]) {
      this.subscribers[message] = [];
    }

    this.subscribers[message].push({ callback });
  }

  private handleMessage(message: any): void {
    if (message.origin === this.config.targetOrigin) {
      this.logger("got a message", message);
      if (this.subscribers[message.data.requestID]) {
        this.subscribers[message.data.requestID].forEach(async sub => {
          try {
            const result = await sub.callback(message.data);
            sub.resolve ? sub.resolve(result) : undefined;
          } catch (err) {
            console.error("error", err);
            sub.reject(err);
          }
        });
      }
      delete this.subscribers[message.data.requestID];
    }
  }
}
