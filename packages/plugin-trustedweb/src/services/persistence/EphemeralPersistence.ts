import { setLocalKey, getLocalKey, deleteLocalKey } from "@kirby-web3/common";

import { EncryptedData, Persistence } from "./Persistence";
const LOCAL_STORAGE_ENTROPY_KEY = "TRUSTED_WEB_EPHEMERAL_ENTROPY";
const LOCAL_STORAGE_DB_KEY = "TRUSTED_WEB_EPHEMERAL_DB";

interface DB {
  [key: string]: { iv: string; cipherText: string };
}

export class EphemeralPersistence implements Persistence {
  public async storeAuthLookupKey(lookupKey: string, iv: string, cipherText: string): Promise<boolean> {
    throw new Error("not implemented");
  }
  public async getByAuthLookupKey(lookupKey: string): Promise<EncryptedData> {
    throw new Error("not implemented");
  }

  public async createUser(username: string): Promise<boolean> {
    throw new Error("not implemented");
  }

  public async storeData(username: string, key: string, iv: string, cipherText: string): Promise<boolean> {
    const db = this.getDB();
    db[key] = { iv, cipherText };
    this.writeDB(db);

    return true;
  }

  public async getData(username: string, key: string): Promise<EncryptedData> {
    const db = this.getDB();
    const data = db[key];
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

  public clearLocalData(): void {
    deleteLocalKey(LOCAL_STORAGE_DB_KEY);
    deleteLocalKey(LOCAL_STORAGE_ENTROPY_KEY);
  }
  public isEphemeral(): boolean {
    return true;
  }

  private getDB(): DB {
    let db = getLocalKey(LOCAL_STORAGE_DB_KEY);
    if (!db) {
      db = {};
      this.writeDB({});
    }

    return db as DB;
  }
  private writeDB(db: DB): void {
    setLocalKey(LOCAL_STORAGE_DB_KEY, db);
  }
}
