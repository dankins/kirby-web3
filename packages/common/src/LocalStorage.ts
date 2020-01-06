import Cookies = require("js-cookie");

const canUseLocalStorage = localStorageAvailable();

export function setLocalKey(storageKey: string, value: object) {
  const storageValue = JSON.stringify(value);
  if (canUseLocalStorage) {
    window.localStorage.setItem(storageKey, storageValue);
  } else {
    // fallback to using a cookie
    Cookies.set(storageKey, storageValue, {
      // @ts-ignore: TS thinks this property doesn't exist, but it does
      sameSite: "none",
      expires: 365,
    });
  }
}

export function getLocalKey(storageKey: string): object | undefined {
  let rtn = null;
  if (canUseLocalStorage) {
    rtn = window.localStorage.getItem(storageKey);
  } else {
    rtn = Cookies.get(storageKey);
  }
  if (!rtn) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(rtn);
    return parsed;
  } catch (err) {
    console.error("error loading value from storage", rtn);
    return undefined;
  }
}

export function localStorageAvailable(): boolean {
  return storageAvailable("localStorage");
}

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Feature-detecting_localStorage
export function storageAvailable(type: string): boolean {
  let storage;
  try {
    // @ts-ignore
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      // note(DK): commenting the next line out since it is breaking jest tests
      // e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0)
    );
  }
}
