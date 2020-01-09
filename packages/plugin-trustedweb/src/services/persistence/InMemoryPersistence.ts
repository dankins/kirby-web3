import { setLocalKey, getLocalKey, deleteLocalKey } from "@kirby-web3/common";

import { EncryptedData, Persistence } from "./Persistence";
const LOCAL_STORAGE_ENTROPY_KEY = "TRUSTED_WEB_ENTROPY";

export class InMemoryPersistence implements Persistence {
  public auth: { [auth: string]: EncryptedData } = {};
  public users: { [username: string]: { [key: string]: { iv: string; cipherText: string } } } = {};

  public async storeAuthLookupKey(lookupKey: string, iv: string, cipherText: string): Promise<boolean> {
    this.auth[lookupKey] = { iv, cipherText };
    return true;
  }
  public async getByAuthLookupKey(lookupKey: string): Promise<EncryptedData> {
    const data = this.auth[lookupKey];
    if (!data) {
      throw new Error("no data");
    }
    return data;
  }

  public async createUser(username: string): Promise<boolean> {
    this.users[username] = {};
    return true;
  }

  public async storeData(username: string, key: string, iv: string, cipherText: string): Promise<boolean> {
    const user = this.users[username];
    if (!user) {
      throw new Error("user not found");
    }
    user[key] = { iv, cipherText };

    return true;
  }

  public async getData(username: string, key: string): Promise<EncryptedData> {
    const user = this.users[username];
    if (!user) {
      throw new Error("user not found");
    }
    const data = user[key];
    if (!data) {
      throw new Error("key not found");
    }
    return data;
  }

  public storeEntropyLocal(username: string, entropy: string): void {
    setLocalKey(LOCAL_STORAGE_ENTROPY_KEY, { username, entropy });
  }
  public getEntropyLocal(): { username: string; entropy: string } | undefined {
    const result = getLocalKey(LOCAL_STORAGE_ENTROPY_KEY);
    if (result) {
      return result as { username: string; entropy: string };
    }
  }
  public isEphemeral(): boolean {
    return false;
  }
  public clearLocalData(): void {
    deleteLocalKey(LOCAL_STORAGE_ENTROPY_KEY);
  }
}
