export const TRUSTEDWEB_AUTHENTICATE = "TRUSTEDWEB_AUTHENTICATE";
export const TRUSTEDWEB_REQUEST_HOME_VIEW = "TRUSTEDWEB_REQUEST_HOME_VIEW";
export const TRUSTEDWEB_LOGOUT = "TRUSTEDWEB_LOGOUT";

export type DID = string;

export interface Authenticate {
  type: typeof TRUSTEDWEB_AUTHENTICATE;
}
export interface RequestHomeView {
  type: typeof TRUSTEDWEB_REQUEST_HOME_VIEW;
}

export interface AuthenticationResult {
  did: DID;
  signature: string;
  message: string;
  ephemeral: boolean;
}
