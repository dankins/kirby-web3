declare module "@audius/hedgehog" {
  export interface Wallet {
    ivHex: string;
    cipherTextHex: string;
    walletObj: any;
    entropy: string;
  }
  export interface etherjsWallet {
    _privKey: Uint8Array;
    _pubKey?: Uint8Array;
  }
  export class Hedgehog {
    constructor(getFn, setAuthFn, setUserFn);
    signUp(username: string, password: string): any;
    async resetPassword(username: string, password: string): Wallet;
    async login(username: string, password: string): Wallet;
    logout();
    isLoggedIn(): boolean;
    getWallet(): Wallet;
    restoreLocalWallet(): Wallet;
    createWalletObj(): Wallet;
  }
  export class WalletManager {
    static async createWalletObj(password, entropyOverride?: string): Promise<Wallet>;
    static async createAuthLookupKey(username: string, password: string): Promise<any>;
    static async decryptCipherTextAndRetrieveWallet(password, ivHex, cipherTextHex);
  }
  export class Authentication {
    static generateWalletFromEntropy(entropy, path): etherjsWallet;
    static encrypt(entropy, ivBuffer, keyBuffer): { cipherText: ArrayBuffer; cipherTextHex: string };
    static createIV(): { ivHex: string; ivBuffer: Uint8Array };
    static decrypt(ivBuffer: Uint8Array, keyBuffer: Uint8Array, cipherTextHex: string): string;
  }

  export default { Hedgehog, WalletManager, Authentication };
}
