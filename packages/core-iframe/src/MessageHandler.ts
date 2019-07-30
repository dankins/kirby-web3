import { ChildIFrameProvider } from "./ethereum/ChildIFrameProvider";

export abstract class MessageHandler {}

export class WindowMessageHandler extends MessageHandler {
  private parentURL: string;
  private parentDomain!: string;
  private ethereum: ChildIFrameProvider;
  public constructor() {
    super();
    let parentDomain: string;
    const parentURL = window.location !== window.parent.location ? document.referrer : document.location.href;
    if (parentURL) {
      const match = parentURL.match(/(.*):\/\/(.[^/]+)/);
      if (match) {
        parentDomain = match[0];
        this.parentDomain = parentDomain;
      }
    }
    this.ethereum = new ChildIFrameProvider((type, data) => {
      parent.postMessage({ type, data }, "http://localhost:3001");
    });
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
        const requestID = message.data.requestID;
        await this.ethereum.initialize();
        if (message.data.request.type === "WEB3_REQUEST") {
          const data = await this.ethereum.handleIFrameMessage(message.data.request.data);
          return parent.postMessage({ requestID: requestID, type: "RESPONSE", data }, "http://localhost:3001");
        }
      }
    }
  }
}
