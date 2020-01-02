import { Action, MiddlewareAPI, Dispatch } from "redux";
import { ParentPlugin, DMZ, MESSAGE_FROM_CHILD } from "@kirby-web3/parent-core";
import { Authenticate, TRUSTEDWEB_AUTHENTICATE, DID, AuthenticationResult } from "../common";

// EthereumPlugin action types
export const TRUSTED_WEB_SOME_ACTION = "TRUSTED_WEB_SOME_ACTION";

export interface TrustedWebParentPluginState {
  user?: any;
}

export interface SomeAction {
  type: typeof TRUSTED_WEB_SOME_ACTION;
  payload: {
    accounts: string[];
  };
}

export type TrustedWebPluginActions = SomeAction;

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

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    next(action);
  };

  public reducer(state: TrustedWebParentPluginState = {}, action: any): any {
    return state;
  }

  public async authenticate(): Promise<AuthenticationResult> {
    const action: Authenticate = { type: TRUSTEDWEB_AUTHENTICATE };
    return this.dependencies.dmz.send(action);
  }
}
