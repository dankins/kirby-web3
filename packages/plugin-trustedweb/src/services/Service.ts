import { WalletManager, Wallet, Authentication } from "@audius/hedgehog";

import { Persistence } from "./persistence/Persistence";
import { TrueName } from "./TrueName";
import { EphemeralPersistence } from "./persistence/EphemeralPersistence";

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

  public loadFromLocalStorage(): TrueName | undefined {
    const result = this.persistence.getEntropyLocal();

    if (result) {
      return new TrueName(result.username, result.entropy, this.persistence);
    }
    const ephemeralPersistence = new EphemeralPersistence();
    const ephemeral = ephemeralPersistence.getEntropyLocal();
    if (ephemeral) {
      return new TrueName(ephemeral.username, ephemeral.entropy, ephemeralPersistence);
    }
  }

  public async createAccount(username: string, password: string, entropyOverride?: string): Promise<AccountResponse> {
    const wallet = await WalletManager.createWalletObj(password, entropyOverride);
    const authLookupKey = await WalletManager.createAuthLookupKey(username, password);
    await this.persistence.storeAuthLookupKey(authLookupKey, wallet.ivHex, wallet.cipherTextHex);
    await this.persistence.createUser(username);
    this.persistence.storeEntropyLocal(username, wallet.entropy);
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
    this.persistence.storeEntropyLocal(username, entropy);

    return new TrueName(username, entropy, this.persistence);
  }

  public createEphemeralAccount(): TrueName {
    const username = "ephemeral";
    const entropy = Authentication.generateMnemonicAndEntropy().entropy;
    const ephemeralPersistence = new EphemeralPersistence();
    ephemeralPersistence.storeEntropyLocal(username, entropy);

    return new TrueName(username, entropy, ephemeralPersistence);
  }

  public async upgradeEphemeralAccount(
    ephemeralTruename: TrueName,
    username: string,
    password: string,
  ): Promise<TrueName> {
    console.log("creating new trusted web account");
    const upgraded = await this.createAccount(username, password, ephemeralTruename.entropy);
    const truename = upgraded.truename;
    console.log("created account");
    const ephemeralProfiles = await ephemeralTruename.getProfiles();

    console.log("creating profiles", ephemeralProfiles);

    for (const profile of ephemeralProfiles) {
      await truename.createProfile(profile.name);
    }

    (ephemeralTruename.persistence as EphemeralPersistence).clearLocalData();

    return truename;
  }
}
