import { Action, MiddlewareAPI, Dispatch } from "redux";
import { ParentPlugin, DMZ, MESSAGE_FROM_CHILD } from "@kirby-web3/parent-core";
import {
  Authenticate,
  TRUSTEDWEB_AUTHENTICATE,
  TRUSTEDWEB_REQUEST_HOME_VIEW,
  AuthenticationResult,
  RequestHomeView,
  TRUSTEDWEB_LOGOUT,
} from "../common";
import { SEND_TO_PARENT, getLocalKey, setLocalKey, deleteLocalKey } from "@kirby-web3/common";

const AUTH_COOKIE = "TRUSTEDWEB_AUTH";

const TRUSTEDWEB_PARENT_SAVED_AUTH = "TRUSTEDWEB_PARENT_SAVED_AUTH";

export interface TrustedWebParentPluginState {
  auth?: AuthenticationResult;
  loadingAuth: boolean;
}

export interface TrustedWebParentAuthenticateAction {
  type: typeof TRUSTEDWEB_AUTHENTICATE;
  payload: {
    auth: AuthenticationResult;
  };
}

export interface TrustedWebParentSavedAuthAction {
  type: typeof TRUSTEDWEB_PARENT_SAVED_AUTH;
  payload: {
    auth: AuthenticationResult;
  };
}

export type TrustedWebPluginActions = TrustedWebParentAuthenticateAction | TrustedWebParentSavedAuthAction;

export interface TrustedWebParentPluginDependencies {
  dmz: DMZ;
}

export class TrustedWebParentPlugin extends ParentPlugin<
  undefined,
  TrustedWebParentPluginDependencies,
  TrustedWebPluginActions
> {
  public name = "trustedweb";
  public dependsOn = ["dmz"];
  public web3: any;
  public provider: any;

  public async startup(): Promise<void> {
    const auth = getLocalKey(AUTH_COOKIE);
    if (auth) {
      const action: TrustedWebParentSavedAuthAction = { type: TRUSTEDWEB_PARENT_SAVED_AUTH, payload: { auth } };
      this.dispatch(action);

      this.requestAuthentication();
    }
  }

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    if (action.type === MESSAGE_FROM_CHILD && action.payload && action.payload.type === SEND_TO_PARENT) {
      // message inception, we must go deeper...
      const message = action.payload.payload;
      if (message.type === TRUSTEDWEB_AUTHENTICATE) {
        // user has authed, so set a cookie to automatically auth on page reload
        setLocalKey(AUTH_COOKIE, message.payload.auth);
      } else if (message.type === TRUSTEDWEB_LOGOUT) {
        deleteLocalKey(AUTH_COOKIE);
      }
    }
    next(action);
  };

  public reducer(state: TrustedWebParentPluginState = { loadingAuth: false }, action: any): any {
    if (action.type === TRUSTEDWEB_PARENT_SAVED_AUTH) {
      return { ...state, auth: action.payload.auth, loadingAuth: true };
    }

    if (action.type === MESSAGE_FROM_CHILD && action.payload && action.payload.type === SEND_TO_PARENT) {
      // message inception, we must go deeper...
      const message = action.payload.payload;
      if (message.type === TRUSTEDWEB_AUTHENTICATE) {
        return { ...state, auth: message.payload.auth, loadingAuth: false };
      } else if (message.type === TRUSTEDWEB_LOGOUT) {
        return { ...state, auth: undefined, loadingAuth: false };
      }
    }
    return state;
  }

  public requestAuthentication(): void {
    const action: Authenticate = { type: TRUSTEDWEB_AUTHENTICATE };
    this.dependencies.dmz.sendAsync(action);
  }

  public showHome(): void {
    const action: RequestHomeView = { type: TRUSTEDWEB_REQUEST_HOME_VIEW };
    this.dependencies.dmz.sendAsync(action);
  }
}
