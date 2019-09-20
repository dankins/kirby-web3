import { MiddlewareAPI, Action, Dispatch } from "redux";
import Cookies = require("js-cookie");
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

export const PARENT_RESPONSE = "PARENT_RESPONSE";
export const PARENT_REQUEST = "PARENT_REQUEST";
export const SITE_PREFERENCE_CHANGE = "SITE_PREFERENCE_CHANGE";

const COOKIE_SITE_PREFERENCE_PREFIX = "kirby:site_preference:";

export interface ParentResponseAction {
  type: typeof PARENT_RESPONSE;
  requestID: number;
  payload: any;
}

export interface ParentRequestAction {
  type: typeof PARENT_REQUEST;
  requestID: number;
  data: any;
}

export interface SitePreferences {
  [key: string]: any;
}
export interface SitePreferenceChange {
  type: typeof SITE_PREFERENCE_CHANGE;
  payload: SitePreferences;
}

export type ParentHandlerActions = ParentResponseAction | ParentRequestAction | SitePreferenceChange;

export type Config = any;
export interface ParentHandlerState {
  pending: {
    [requestID: number]: any;
  };
  sitePreferences: { [key: string]: any };
}

export class ParentHandler extends ChildPlugin<Config, ParentHandlerState, ParentHandlerActions> {
  public name = "iframe";
  public parentDomain: string;

  public constructor() {
    super();

    // initialize parent listener
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
          type: PARENT_REQUEST,
          requestID: message.data.requestID,
          data: message.data.request,
        });
      }
    }
  }

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    if (action.type === PARENT_RESPONSE) {
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
      this.logger(SEND_TO_PARENT, action.payload);
      this.sendToParent(action.payload);
    }
    next(action);
  };

  public async startup(): Promise<void> {
    const sitePreferences = this.loadSitePreferences();
    this.dispatch({ type: SITE_PREFERENCE_CHANGE, payload: sitePreferences });
  }

  public reducer(
    state: ParentHandlerState = { pending: {}, sitePreferences: {} },
    action: ParentHandlerActions,
  ): ParentHandlerState {
    this.logger("got an action", action);

    switch (action.type) {
      case PARENT_REQUEST:
        return { ...state, pending: { ...state.pending, [action.requestID]: action } };
      case SITE_PREFERENCE_CHANGE:
        return { ...state, sitePreferences: action.payload };
    }

    return state;
  }

  public sendToParent(message: ChildToParentMessage): void {
    parent.postMessage(message, this.parentDomain);
  }

  public respond(requestID: number, payload: any): void {
    this.dispatch({ type: PARENT_RESPONSE, requestID, payload });
  }

  public setSitePreference(key: string, value: any): void {
    const state = this.getState().iframe as ParentHandlerState;
    const prefs = state.sitePreferences;
    prefs[key] = value;
    Cookies.set(COOKIE_SITE_PREFERENCE_PREFIX + this.parentDomain, JSON.stringify(prefs));
    this.dispatch({ type: SITE_PREFERENCE_CHANGE, payload: prefs });
  }

  public getSitePreference(key: string): any | undefined {
    const state = this.getState().iframe as ParentHandlerState;
    const prefs = state.sitePreferences;

    return prefs[key];
  }

  private loadSitePreferences(): SitePreferences {
    const prefs = Cookies.get(COOKIE_SITE_PREFERENCE_PREFIX + this.parentDomain);
    if (!prefs) {
      return {};
    }

    try {
      const parsed = JSON.parse(prefs);
      return parsed;
    } catch (err) {
      console.error("error parsing site preferences", prefs);
      return {};
    }
  }
}
