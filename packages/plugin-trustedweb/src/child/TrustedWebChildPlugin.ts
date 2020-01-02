import { MiddlewareAPI, Action, Dispatch } from "redux";

import { ChildPlugin, ParentHandler, PARENT_REQUEST, ViewPlugin } from "@kirby-web3/child-core";
import { TRUSTEDWEB_AUTHENTICATE, AuthenticationResult } from "../common";

import { TrustedWebService } from "../services/Service";
import { Profile, TrueName } from "../services/TrueName";
import { HttpPersistence } from "../services/Persistence";

const TRUSTEDWEB_CHILD_LOGIN = "TRUSTEDWEB_CHILD_LOGIN";
const TRUSTEDWEB_CHILD_SIGNUP = "TRUSTEDWEB_CHILD_SIGNUP";
const TRUSTEDWEB_CHILD_PROFILE_SELECTED = "TRUSTEDWEB_CHILD_PROFILE_SELECTED";
const TRUSTEDWEB_CHILD_PROFILE_CREATED = "TRUSTEDWEB_CHILD_PROFILE_CREATED";
const TRUSTEDWEB_CHILD_PROFILES_CHANGED = "TRUSTEDWEB_CHILD_PROFILES_CHANGED";

interface TrustedWebChildLoginAction {
  type: typeof TRUSTEDWEB_CHILD_LOGIN;
  payload: {
    currentUser: CurrentUser;
  };
}
interface TrustedWebChildSignupAction {
  type: typeof TRUSTEDWEB_CHILD_SIGNUP;
  payload: {
    currentUser: CurrentUser;
  };
}

interface TrustedWebChildProfileCreatedAction {
  type: typeof TRUSTEDWEB_CHILD_PROFILE_CREATED;
  payload: {
    profile: Profile;
  };
}

interface TrustedWebChildProfileSelectedAction {
  type: typeof TRUSTEDWEB_CHILD_PROFILE_SELECTED;
  payload: {
    selectedProfile: Profile;
  };
}

interface TrustedWebChildProfilesChangedAction {
  type: typeof TRUSTEDWEB_CHILD_PROFILES_CHANGED;
  payload: {
    profiles: Profile[];
  };
}

type TrustedWebChildActions =
  | TrustedWebChildLoginAction
  | TrustedWebChildSignupAction
  | TrustedWebChildProfileCreatedAction
  | TrustedWebChildProfileSelectedAction
  | TrustedWebChildProfilesChangedAction;

export interface TrustedWebChildPluginState {
  currentUser?: CurrentUser;
}

export interface CurrentUser {
  username: string;
  profiles?: Profile[];
  selectedProfile?: Profile;
}

export interface TrustedWebChildPluginConfig {
  service?: TrustedWebService;
}

export class TrustedWebChildPlugin extends ChildPlugin<TrustedWebChildPluginConfig> {
  public name = "trustedweb";
  public dependsOn = ["iframe", "view", "ethereum"];
  private service!: TrustedWebService;
  private truename?: TrueName;

  public async startup(): Promise<void> {
    if (!this.config || !this.config.service) {
      throw new Error("cannot start up without either providing a `service` via config  ");
    }

    this.service = this.config.service!;
  }

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    const viewPlugin = this.dependencies.view as ViewPlugin;
    if (action.type === PARENT_REQUEST && action.data.type === TRUSTEDWEB_AUTHENTICATE) {
      viewPlugin.requestView("/trustedweb/authenticate", { requestID: action.requestID });
      next(action);
      return;
    }

    next(action);
  };

  public reducer(state: TrustedWebChildPluginState = {}, action: TrustedWebChildActions): any {
    if (action.type === TRUSTEDWEB_CHILD_SIGNUP) {
      return { ...state, currentUser: action.payload.currentUser };
    } else if (action.type === TRUSTEDWEB_CHILD_LOGIN) {
      return { ...state, currentUser: action.payload.currentUser };
    } else if (action.type === TRUSTEDWEB_CHILD_PROFILE_CREATED) {
      const nextProfiles = [...state.currentUser!.profiles!, action.payload.profile];
      return { ...state, currentUser: { ...state.currentUser!, profiles: nextProfiles } };
    } else if (action.type === TRUSTEDWEB_CHILD_PROFILE_SELECTED) {
      const currentUser = state.currentUser!;
      return { ...state, currentUser: { ...currentUser, selectedProfile: action.payload.selectedProfile } };
    } else if (action.type === TRUSTEDWEB_CHILD_PROFILES_CHANGED) {
      const currentUser = state.currentUser!;
      return { ...state, currentUser: { ...currentUser, profiles: action.payload.profiles } };
    }
    return state;
  }

  public cancelAuthenticate(requestID: number): void {
    const iframePlugin = this.dependencies.iframe as ParentHandler;
    iframePlugin.reject(requestID, "cancelled");
  }

  public async login(username: string, password: string): Promise<any> {
    const truename = await this.service.login(username, password);
    this.truename = truename;
    const action: TrustedWebChildLoginAction = {
      type: TRUSTEDWEB_CHILD_LOGIN,
      payload: {
        currentUser: {
          username: truename.username,
        },
      },
    };
    this.dispatch(action);
    const profiles = await this.getProfiles();
    const profilesAction: TrustedWebChildProfilesChangedAction = {
      type: TRUSTEDWEB_CHILD_PROFILES_CHANGED,
      // copying this object since it
      payload: { profiles: profiles.concat([]) },
    };
    this.dispatch(profilesAction);
    return truename;
  }

  public async signup(username: string, password: string): Promise<any> {
    const result = await this.service.createAccount(username, password);
    this.truename = result.truename;
    const action: TrustedWebChildSignupAction = {
      type: TRUSTEDWEB_CHILD_SIGNUP,
      payload: {
        currentUser: {
          username: result.username,
          profiles: [],
        },
      },
    };
    this.dispatch(action);
    return result;
  }

  public async getProfiles(): Promise<Profile[]> {
    if (!this.truename) {
      throw new Error("truename not loaded");
    }
    return this.truename.getProfiles();
  }

  public async createProfile(name: string): Promise<Profile> {
    if (!this.truename) {
      throw new Error("truename not loaded");
    }
    const profile = await this.truename.createProfile(name);
    const action: TrustedWebChildProfileCreatedAction = {
      type: TRUSTEDWEB_CHILD_PROFILE_CREATED,
      payload: { profile },
    };
    this.dispatch(action);

    return profile;
  }

  public async changeProfile(selectedProfile: Profile): Promise<Profile> {
    if (!this.truename) {
      throw new Error("truename not loaded");
    }
    const action: TrustedWebChildProfileSelectedAction = {
      type: TRUSTEDWEB_CHILD_PROFILE_SELECTED,
      payload: { selectedProfile },
    };
    this.dispatch(action);
    await this.dependencies.ethereum.setPrivateKeyProvider(selectedProfile.privateKey, "rinkeby");

    return selectedProfile;
  }

  public authenticate(requestID: number, result: AuthenticationResult): void {
    const iframePlugin = this.dependencies.iframe as ParentHandler;
    iframePlugin.respond(requestID, result);
  }
}

export function buildTrustedWebChildPlugin(idHubURL: string): TrustedWebChildPlugin {
  return new TrustedWebChildPlugin({
    service: new TrustedWebService(new HttpPersistence({ baseURL: idHubURL })),
  });
}
