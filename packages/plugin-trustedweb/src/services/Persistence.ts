import { setLocalKey, getLocalKey } from "@kirby-web3/common";

const LOCAL_STORAGE_ENTROPY_KEY = "TRUSTED_WEB_ENTROPY";
export interface EncryptedData {
  iv: string;
  cipherText: string;
}

export interface Persistence {
  // lookupKey is the generated by encrypting `username::password` using a hardcoded IV
  // iv is the initialization vector used to encrypt the cipherText (different for each user)
  // cipherText contains the encrypted `entropy` string
  storeAuthLookupKey(lookupKey: string, iv: string, cipherText: string): Promise<boolean>;
  // encrypt `username::password` using the hardcoded IV, and use that as a key
  // to locate the ciphertext containing the user's entropy / seed phrase
  getByAuthLookupKey(lookupKey: string): Promise<EncryptedData>;
  // createUser stores the username to prevent duplicate user accounts
  // otherwise the same username+password could be used with different ivs
  createUser(username: string): Promise<boolean>;
  // storeData is used to store a list of profiles so we can rehydrate them upon loading the wallet
  storeData(username: string, key: string, iv: string, cipherText: string): Promise<boolean>;
  // getData is used to store encrypted data by key
  getData(username: string, key: string): Promise<EncryptedData>;

  storeEntropyLocal(username: string, entropy: string): void;
  getEntropyLocal(): { username: string; entropy: string } | undefined;
}

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

    console.log("auth data:", data);

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
    console.log("storeData result:", result);

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

    console.log("auth data:", data);

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
}

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
}
