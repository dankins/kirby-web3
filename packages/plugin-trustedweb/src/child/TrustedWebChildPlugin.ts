import { MiddlewareAPI, Action, Dispatch } from "redux";

import {
  ChildPlugin,
  ParentHandler,
  PARENT_REQUEST,
  ViewPlugin,
  PARENT_RESPONSE,
  PARENT_MESSAGE,
} from "@kirby-web3/child-core";
import { ProviderTypes, ETHEREUM_WEB3_CHANGE_ACCOUNT, Network, EthereumChildPlugin } from "@kirby-web3/plugin-ethereum";
import {
  TRUSTEDWEB_AUTHENTICATE,
  TRUSTEDWEB_LOGOUT,
  AuthenticationResult,
  TRUSTEDWEB_REQUEST_HOME_VIEW,
} from "../common";

import { TrustedWebService } from "../services/Service";
import { Profile, TrueName } from "../services/TrueName";
import { HttpPersistence } from "../services/persistence/HttpPersistence";
import { EphemeralPersistence } from "../services/persistence";
import { SEND_TO_PARENT } from "@kirby-web3/common";

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

interface TrustedWebChildLogout {
  type: typeof TRUSTEDWEB_LOGOUT;
}

export type TrustedWebChildActions =
  | TrustedWebChildLoginAction
  | TrustedWebChildSignupAction
  | TrustedWebChildProfileCreatedAction
  | TrustedWebChildProfileSelectedAction
  | TrustedWebChildProfilesChangedAction
  | TrustedWebChildLogout;

export interface TrustedWebChildPluginState {
  currentUser?: CurrentUser;
}

export interface CurrentUser {
  username: string;
  profiles?: Profile[];
  selectedProfile?: Profile;
  ephemeral: boolean;
}

export interface TrustedWebChildPluginConfig {
  service?: TrustedWebService;
  useEphemeralTruename?: boolean;
}

export class TrustedWebChildPlugin extends ChildPlugin<TrustedWebChildPluginConfig> {
  public name = "trustedweb";
  public dependsOn = ["iframe", "view", "ethereum"];
  private service!: TrustedWebService;
  private truename?: TrueName;
  private profiles?: Profile[];

  public async startup(): Promise<void> {
    if (!this.config || !this.config.service) {
      throw new Error("cannot start up without either providing a `service` via config  ");
    }

    this.service = this.config.service!;
    const truename = this.service.loadFromLocalStorage();
    if (truename) {
      await this.changeTruename(truename, truename.persistence instanceof EphemeralPersistence);
    } else if (this.config.useEphemeralTruename) {
      await this.createEphemeral();
    }
  }

  public middleware = (api: MiddlewareAPI<any>) => (next: Dispatch<any>) => <A extends Action>(action: any): void => {
    const iframePlugin = this.dependencies.iframe as ParentHandler;
    const viewPlugin = this.dependencies.view as ViewPlugin;
    if (action.type === PARENT_MESSAGE) {
      if (action.payload.type === TRUSTEDWEB_AUTHENTICATE) {
        const maybeCurrentUser = this.getState().trustedweb.currentUser;
        if (maybeCurrentUser && maybeCurrentUser.selectedProfile) {
          this.authenticate().catch(err => {
            console.log("error authenticating", err, this.getState().trustedweb.currentUser);
          });
        } else {
          viewPlugin.requestView("/trustedweb/authenticate", { requestID: action.requestID });
        }
        next(action);
        return;
      }
      if (action.payload.type === TRUSTEDWEB_REQUEST_HOME_VIEW) {
        viewPlugin.requestView("/trustedweb/home");
        next(action);
        return;
      }
    } else if (action.type === PARENT_REQUEST && action.data.type === "WEB3_ENABLE") {
      const providerType = iframePlugin.getSitePreference("WEB3_PROVIDER_TYPE");

      // intercept this event if preferred provider is TrustedWeb
      if (providerType === "TrustedWeb" || this.config.useEphemeralTruename) {
        console.log("intercepting web3 enable", action, this.profiles);
        const requestID = action.requestID;
        const ethereumPlugin = this.dependencies.ethereum as EthereumChildPlugin;
        this.activateWeb3Provider(this.profiles![0], ethereumPlugin.config.defaultNetwork)
          .then(result => {
            this.dispatch({
              type: PARENT_RESPONSE,
              requestID,
              payload: { providerType, network: ethereumPlugin.config.defaultNetwork, requestType: "WEB3_ENABLE" },
            });
          })
          .catch(err => {
            console.log("error activating web3 provider", err);
          });

        return;
      }
    } else if (action.type === "PARENT_REQUEST" && action.data.type === ETHEREUM_WEB3_CHANGE_ACCOUNT) {
      viewPlugin.requestView("/trustedweb/select-profile", {
        network: api.getState().ethereum.network,
        requestID: action.requestID,
      });
      return;
    }

    next(action);
  };

  public reducer(state: TrustedWebChildPluginState = {}, action: TrustedWebChildActions): any {
    if (action.type === TRUSTEDWEB_CHILD_SIGNUP) {
      return { ...state, currentUser: action.payload.currentUser };
    } else if (action.type === TRUSTEDWEB_CHILD_LOGIN) {
      return { ...state, currentUser: action.payload.currentUser };
    } else if (action.type === TRUSTEDWEB_LOGOUT) {
      return { ...state, currentUser: undefined };
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
    await this.changeTruename(truename);
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
          ephemeral: false,
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
    await this.activateWeb3Provider(selectedProfile, "rinkeby");

    await this.authenticate();

    return selectedProfile;
  }

  public async authenticate(): Promise<AuthenticationResult> {
    const currentUser = this.getState().trustedweb.currentUser;
    const parentDomain = this.getState().iframe.parentDomain;

    const ethPlugin = this.dependencies.ethereum as EthereumChildPlugin;
    await ethPlugin.setPrivateKeyProvider(
      currentUser!.selectedProfile!.privateKey,
      "rinkeby",
      ProviderTypes.TRUSTEDWEB,
    );
    console.log("web3", ethPlugin.web3);
    const accounts = await (ethPlugin.web3 as any).eth.getAccounts();
    console.log("accounts", accounts);
    const signer = accounts[0];
    const message = `Authenticate to ${parentDomain} @ ${new Date().toISOString()}`;
    const signature = await (ethPlugin.web3 as any).eth.personal.sign(message, signer);
    const result: AuthenticationResult = {
      did: "did:ethr:" + signer,
      message,
      signature,
      ephemeral: this.truename!.persistence.isEphemeral(),
    };
    console.log("signature", result);

    const iframePlugin = this.dependencies.iframe as ParentHandler;
    iframePlugin.sendToParent({
      type: SEND_TO_PARENT,
      payload: { type: TRUSTEDWEB_AUTHENTICATE, payload: { auth: result } },
    });

    return result;
  }

  public async upgradeEphemeral(username: string, password: string): Promise<void> {
    if (!this.truename) {
      throw new Error("truename not loaded");
    }
    if (!this.getState().trustedweb.currentUser.ephemeral) {
      throw new Error("truename is not ephemeral");
    }
    const newTruename = await this.service.upgradeEphemeralAccount(this.truename, username, password);
    console.log("new truename", newTruename);
    return this.changeTruename(newTruename);
  }

  public logout(): void {
    this.truename!.persistence.clearLocalData();
    this.truename = undefined;
    this.dispatch({ type: TRUSTEDWEB_LOGOUT });
    const iframePlugin = this.dependencies.iframe as ParentHandler;
    iframePlugin.sendToParent({ type: SEND_TO_PARENT, payload: { type: TRUSTEDWEB_LOGOUT, payload: {} } });
  }

  private async changeTruename(truename: TrueName, ephemeral: boolean = false): Promise<void> {
    this.truename = truename;
    const action: TrustedWebChildLoginAction = {
      type: TRUSTEDWEB_CHILD_LOGIN,
      payload: {
        currentUser: {
          username: this.truename!.username,
          ephemeral,
        },
      },
    };
    this.dispatch(action);
    const profiles = await this.getProfiles();
    this.profiles = profiles;
    const profilesAction: TrustedWebChildProfilesChangedAction = {
      type: TRUSTEDWEB_CHILD_PROFILES_CHANGED,
      // copying this object since to get a new reference and make sure rerenders occur
      payload: { profiles: profiles.concat([]) },
    };
    this.dispatch(profilesAction);
  }

  private async activateWeb3Provider(profile: Profile, network: Network): Promise<void> {
    return this.dependencies.ethereum.setPrivateKeyProvider(profile.privateKey, network, ProviderTypes.TRUSTEDWEB);
  }

  private async createEphemeral(): Promise<void> {
    const truename = this.service.createEphemeralAccount();
    const p1 = await truename.createProfile("Default");
    await this.changeTruename(truename, true);
  }
}

export function buildTrustedWebChildPlugin(
  idHubURL: string,
  useEphemeralTruename: boolean = false,
): TrustedWebChildPlugin {
  return new TrustedWebChildPlugin({
    service: new TrustedWebService(new HttpPersistence({ baseURL: idHubURL })),
    useEphemeralTruename,
  });
}
