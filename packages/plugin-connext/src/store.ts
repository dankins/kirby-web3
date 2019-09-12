export const store = {
  get: (path: any) => {
    const raw = localStorage.getItem(`CF_NODE:${path}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
    // Handle partial matches so the following line works -.-
    // https://github.com/counterfactual/monorepo/blob/master/packages/node/src/store.ts#L54
    if (path.endsWith("channel") || path.endsWith("appInstanceIdToProposedAppInstance")) {
      const partialMatches: any = {};
      for (const k of Object.keys(localStorage)) {
        if (k.includes(`${path}/`)) {
          try {
            partialMatches[k.replace("CF_NODE:", "").replace(`${path}/`, "")] = JSON.parse(localStorage.getItem(k)!);
          } catch {
            partialMatches[k.replace("CF_NODE:", "").replace(`${path}/`, "")] = localStorage.getItem(k);
          }
        }
      }
      return partialMatches;
    }
    return raw;
  },
  set: (pairs: any, allowDelete: any) => {
    for (const pair of pairs) {
      localStorage.setItem(
        `CF_NODE:${pair.path}`,
        typeof pair.value === "string" ? pair.value : JSON.stringify(pair.value),
      );
    }
  },
};
