import { WalletManager, Wallet } from "@audius/hedgehog";

import { Persistence } from "./Persistence";
import { TrueName } from "./TrueName";

export interface AccountResponse {
  username: string;
  wallet: Wallet;
  authLookupKey: string;
  truename: TrueName;
}

export class TrustedWebService {
  private persistence: Persistence;
  constructor(persistence: Persistence) {
    this.persistence = persistence;
  }

  public async createAccount(username: string, password: string, entropyOverride?: string): Promise<AccountResponse> {
    const wallet = await WalletManager.createWalletObj(password, entropyOverride);
    const authLookupKey = await WalletManager.createAuthLookupKey(username, password);
    await this.persistence.storeAuthLookupKey(authLookupKey, wallet.ivHex, wallet.cipherTextHex);
    await this.persistence.createUser(username);
    return { username, wallet, authLookupKey, truename: new TrueName(username, wallet.entropy, this.persistence) };
  }

  public async login(username: string, password: string): Promise<TrueName> {
    const authLookupKey = await WalletManager.createAuthLookupKey(username, password);
    let iv;
    let cipherText;
    try {
      const data = await this.persistence.getByAuthLookupKey(authLookupKey);
      iv = data.iv;
      cipherText = data.cipherText;
    } catch (err) {
      console.log("err", err.message);
      if (err.message === "not found") {
        throw err;
      }
      throw new Error("error retrieving cipherText");
    }

    const { entropy } = await WalletManager.decryptCipherTextAndRetrieveWallet(password, iv, cipherText);

    return new TrueName(username, entropy, this.persistence);
  }
}
