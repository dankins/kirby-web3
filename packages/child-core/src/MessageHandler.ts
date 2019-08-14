import { Core } from "./Core";

export abstract class MessageHandler {
  protected core: Core;
  constructor(core: Core) {
    this.core = core;
  }
}

export class WindowMessageHandler extends MessageHandler {
  private parentURL: string;
  private parentDomain: string;

  public constructor(core: Core) {
    super(core);
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

    console.log("WindowMessageHandler from parentUrl: ", parentURL);
    this.parentURL = parentURL;

    if (window.addEventListener) {
      window.addEventListener("message", this.handleMessage.bind(this));
    } else {
      (window as any).attachEvent("onmessage", this.handleMessage.bind(this));
    }
    //parent.postMessage({ type: "ALIVE", data: {} }, this.parentURL);
  }
  public reply(type: any, data: any): void {
    parent.postMessage({ type: "REPLY_" + type, data }, this.parentURL);
  }

  public async handleMessage(message: any): Promise<void> {
    if (message.origin === this.parentDomain) {
      if (message.data.requestID) {
        const data = await this.core.receiveMessage(message.data);
        const requestID = message.data.requestID;
        return parent.postMessage({ requestID: requestID, type: "RESPONSE", data }, "http://localhost:3001");
      }
    }
  }
}
