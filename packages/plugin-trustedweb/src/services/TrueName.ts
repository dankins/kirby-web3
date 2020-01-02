import { Authentication, etherjsWallet } from "@audius/hedgehog";
import { Persistence } from "./Persistence";

// default path for ethereum, but missing the last `/0` (since the account will be appended in the createWalllet method)
const DEFAULT_PATH = "m/44'/60'/0'/0";

export interface Profile {
  index: number;
  name: string;
  address: string;
  privateKey: string;
  publicKey: string;
}

export class TrueName {
  // /https://stackoverflow.com/questions/38987784/how-to-convert-a-hexadecimal-string-to-uint8array-and-back-in-javascript
  public static bufferToHex(buffer: Uint8Array): string {
    return "0x" + buffer.reduce((str: string, byte: number) => str + byte.toString(16).padStart(2, "0"), "");
  }

  // Utils is not exported from library, so copying here
  // https://github.com/AudiusProject/hedgehog/blob/master/src/utils.js#L5
  public static bufferFromHexString(hexString: string): Uint8Array {
    return new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  }

  public entropy: string;
  public username: string;
  public masterWallet: etherjsWallet;
  public path: string;
  public persistence: Persistence;

  private profiles?: Profile[];

  constructor(username: string, entropy: string, persistence: Persistence, hdPath?: string) {
    this.username = username;
    this.entropy = entropy;
    this.persistence = persistence;
    this.path = DEFAULT_PATH || hdPath;
    this.masterWallet = this.createWallet(0);
    this.loadProfiles().catch(err => {
      console.log("error loading profiles", err);
    });
  }

  public async loadProfiles(): Promise<void> {
    try {
      const encryptedProfiles = await this.persistence.getData(this.username, "profiles");
      this.profiles = this.deserializeProfiles(encryptedProfiles.iv, encryptedProfiles.cipherText);
      console.log("loaded profiles", this.profiles);
      return;
    } catch (err) {
      if (err.message === "key not found") {
        this.profiles = [];
      } else {
        throw err;
      }
    }
  }

  public async getProfiles(): Promise<Profile[]> {
    if (!this.profiles) {
      await this.loadProfiles();
    }
    return this.profiles || [];
  }

  public async saveProfiles(): Promise<void> {
    const data = this.serializeProfiles();
    const encryptedProfiles = await this.persistence.storeData(this.username, "profiles", data.iv, data.cipherText);
    console.log("saveProfiles success", encryptedProfiles);
  }

  public async createProfile(name: string): Promise<Profile> {
    if (!this.profiles) {
      await this.loadProfiles();
    }
    const nextIndex = this.profiles!.length;
    const profile = this.loadProfile(nextIndex, name);
    this.profiles![profile.index] = profile;

    const serialized = this.serializeProfiles();
    await this.persistence.storeData(this.username, "profiles", serialized.iv, serialized.cipherText);

    return profile;
  }

  public serializeProfiles(): { iv: string; plaintext: string; cipherText: string } {
    if (!this.profiles) {
      throw new Error("profiles not loaded");
    }

    const plaintext = JSON.stringify(this.profiles.map(p => p.name));

    const iv = Authentication.createIV();
    const result = Authentication.encrypt(plaintext, iv.ivBuffer, this.masterWallet._privKey);

    return { iv: iv.ivHex, plaintext, cipherText: result.cipherTextHex };
  }

  public deserializeProfiles(iv: string, cipherText: string): Profile[] {
    const ivBuffer = TrueName.bufferFromHexString(iv);
    const result = Authentication.decrypt(ivBuffer, this.masterWallet._privKey, cipherText);
    if (!result || result.length === 0) {
      throw new Error("unable to decrypt");
    }
    let data: string[];
    try {
      data = JSON.parse(result);
    } catch (err) {
      throw new Error("unable to decrypt");
    }

    return data.map((name, idx) => this.loadProfile(idx, name));
  }
  public loadProfile(index: number, name: string): Profile {
    const wallet = this.createWallet(index + 1);

    const profile = {
      index,
      name,
      address: TrueName.bufferToHex(wallet.getAddress()),
      publicKey: TrueName.bufferToHex(wallet._pubKey),
      privateKey: TrueName.bufferToHex(wallet._privKey),
    };

    return profile;
  }

  private createWallet(index: number): any {
    return Authentication.generateWalletFromEntropy(this.entropy, `${this.path}/${index}`);
  }
}
