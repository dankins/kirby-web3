export const TRUSTEDWEB_AUTHENTICATE = "TRUSTEDWEB_AUTHENTICATE";

export type DID = string;

export interface Authenticate {
  type: typeof TRUSTEDWEB_AUTHENTICATE;
}

export interface AuthenticationResult {
  did: DID;
  signature: string;
  message: string;
}
