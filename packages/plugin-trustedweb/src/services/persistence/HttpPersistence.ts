import { setLocalKey, getLocalKey, deleteLocalKey } from "@kirby-web3/common";

import { Persistence, EncryptedData } from "./Persistence";
const LOCAL_STORAGE_ENTROPY_KEY = "TRUSTED_WEB_ENTROPY";

export interface HttpPersistenceConfig {
  baseURL: string;
  disableLocalStorage?: boolean;
}
export class HttpPersistence implements Persistence {
  private config: HttpPersistenceConfig;
  public constructor(config: HttpPersistenceConfig) {
    this.config = config;
  }

  public async storeAuthLookupKey(lookupKey: string, iv: string, cipherText: string): Promise<any> {
    const result = await fetch(`${this.config.baseURL}/authentication`, {
      method: "POST",
      body: JSON.stringify({ lookupKey, iv, cipherText }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (result.status !== 200) {
      console.log("error saving account");
      throw new Error("error creating account");
    }

    return true;
  }
  // encrypt `username::password` using the hardcoded IV, and use that as a key
  // to locate the ciphertext containing the user's entropy / seed phrase
  public async getByAuthLookupKey(lookupKey: string): Promise<EncryptedData> {
    const result = await fetch(`${this.config.baseURL}/authentication/${lookupKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (result.status === 404) {
      throw new Error("not found");
    }

    const data = await result.json();

    return data;
  }
  // createUser stores the username to prevent duplicate user accounts
  // otherwise the same username+password could be used with different ivs
  public async createUser(username: string): Promise<boolean> {
    const result = await fetch(`${this.config.baseURL}/users`, {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (result.status !== 200) {
      console.log("error saving account");
      throw new Error("error creating account");
    }

    return true;
  }
  // storeData is used to store a list of profiles so we can rehydrate them upon loading the wallet
  public async storeData(username: string, key: string, iv: string, cipherText: string): Promise<boolean> {
    const result = await fetch(`${this.config.baseURL}/users/${encodeURI(username)}/store/${encodeURI(key)}`, {
      method: "POST",
      body: JSON.stringify({ iv, cipherText }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (result.status !== 200) {
      throw new Error("");
    }

    return true;
  }

  // encrypt `username::password` using the hardcoded IV, and use that as a key
  // to locate the ciphertext containing the user's entropy / seed phrase
  public async getData(username: string, key: string): Promise<EncryptedData> {
    const result = await fetch(`${this.config.baseURL}/users/${encodeURI(username)}/store/${encodeURI(key)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (result.status === 404) {
      throw new Error("key not found");
    } else if (result.status !== 200) {
      console.log("error getting data", result);
      throw new Error("error getting data");
    }

    const data = await result.json();

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
    deleteLocalKey(LOCAL_STORAGE_ENTROPY_KEY);
  }
  public isEphemeral(): boolean {
    return false;
  }
}
