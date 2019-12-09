import { InMemoryPersistence } from "./Persistence";
import { TrueName } from "./TrueName";
import { Authentication } from "@audius/hedgehog";

jest.unmock("@audius/hedgehog");
const MOCK_IV = "47a3a72fd0996b589dd168a43e4be85e";
Authentication.createIV = jest.fn().mockReturnValue({
  ivHex: MOCK_IV,
  ivBuffer: TrueName.bufferFromHexString(MOCK_IV),
});

const username = "test";
const entropy = "a4ce544338d265ac873945c3cc7c3909";

describe("TrueName", () => {
  let persistence: InMemoryPersistence;
  beforeEach(async () => {
    persistence = new InMemoryPersistence();
    await persistence.createUser(username);
  });

  it("load truename", () => {
    const truename = new TrueName(username, entropy, persistence);

    const pk = TrueName.bufferToHex(truename.masterWallet._privKey);

    expect(pk).toEqual("0xb6d5d90a4e45005c282279249b94849adee026adf5cb554af146661b4ea93192");
  });

  it("create profile", async () => {
    const truename = new TrueName(username, entropy, persistence);

    const profile1 = await truename.createProfile("profile1");
    const profile2 = await truename.createProfile("profile2");
    const profile3 = await truename.createProfile("profile3");

    expect(profile1).toEqual({
      index: 0,
      address: "0x27fbb277f30419ba3c1f9e778dd51d872df034ef",
      name: "profile1",
      privateKey: "0xfddedb6f145d483cec5d2f2bf4e8647dc81545005d01cfe547551c1d76d8d945",
      publicKey:
        "0x3f4296261f6e3f881b868c8920bdc139ca352721af43a35984f7d6f1d944cb72707c9d505a642f7723eef2334a01bd53c79b6feea2ad54033dd44e4944497993",
    });

    expect(profile2).toEqual({
      index: 1,
      address: "0xa91bb2c80007dcfd831b2a1e80b4d6e844188850",
      name: "profile2",
      privateKey: "0xfa41fa8c515a515380a7ea07c1439a07fff62b565e99bdebf4579f5ab41abd6d",
      publicKey:
        "0x497d1a4dc97f0867bc6896337a27315e87244d0351731491ea403126cf095a02b171fbe58bf705ea3be10129335700dd46c84b203860eebfb406f1a2d887e33e",
    });

    expect(profile3).toEqual({
      index: 2,
      address: "0xec862bf84f343c132f2db8250ef616a73f27a12d",
      name: "profile3",
      privateKey: "0x81599b005fe14be29377d5b6a81031a99234fd03e551883bd2e5bc229dfb4f2b",
      publicKey:
        "0xfb3755ef06e5ef676220afdce4e415a3e3dc9d31e96a1d6e71a34fea38a12a9023a3700265d47a59b6630c5a66aef024730111c6f14d700f56dd62a405580889",
    });
  });

  it("serialize profiles", async () => {
    const truename = new TrueName(username, entropy, persistence);
    await truename.createProfile("profile1");
    await truename.createProfile("profile2");

    const result = truename.serializeProfiles();
    expect(result).toEqual({
      cipherText: "ddbd50e3940a862b705abacd604589f6aa736434a382b893f02f598fa99d9486052d37fb4fdb71ec27d1b640115f5e6e",
      iv: MOCK_IV,
      plaintext: '["profile1","profile2"]',
    });
  });

  it("deserialize profiles", async () => {
    const truename = new TrueName(username, entropy, persistence);
    await truename.createProfile("profile1");
    await truename.createProfile("profile2");
    const result = truename.deserializeProfiles(
      MOCK_IV,
      "ddbd50e3940a862b705abacd604589f6aa736434a382b893f02f598fa99d9486052d37fb4fdb71ec27d1b640115f5e6e",
    );
    expect(result).toEqual([
      {
        address: "0x27fbb277f30419ba3c1f9e778dd51d872df034ef",
        index: 0,
        name: "profile1",
        privateKey: "0xfddedb6f145d483cec5d2f2bf4e8647dc81545005d01cfe547551c1d76d8d945",
        publicKey:
          "0x3f4296261f6e3f881b868c8920bdc139ca352721af43a35984f7d6f1d944cb72707c9d505a642f7723eef2334a01bd53c79b6feea2ad54033dd44e4944497993",
      },
      {
        address: "0xa91bb2c80007dcfd831b2a1e80b4d6e844188850",
        index: 1,
        name: "profile2",
        privateKey: "0xfa41fa8c515a515380a7ea07c1439a07fff62b565e99bdebf4579f5ab41abd6d",
        publicKey:
          "0x497d1a4dc97f0867bc6896337a27315e87244d0351731491ea403126cf095a02b171fbe58bf705ea3be10129335700dd46c84b203860eebfb406f1a2d887e33e",
      },
    ]);
  });
});
