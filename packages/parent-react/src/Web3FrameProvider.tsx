import * as React from "react";
import { Kirby, ParentPlugin } from "@kirby-web3/parent-core";
import { Provider, ReactReduxContextValue, useStore, useDispatch, useSelector } from "react-redux";

export interface IKirbyContext extends ReactReduxContextValue {
  kirby: Kirby;
}

const kirby = new Kirby();
const startingContext: IKirbyContext = { kirby, store: kirby.redux, storeState: {} };
export const KirbyContext = React.createContext(startingContext);

// @ts-ignore
export const KirbyReduxContext = React.createContext<ReactReduxContextValue>(null);

// TODO(dankins): if people are using redux this is going to conflict
// https://react-redux.js.org/next/api/hooks#custom-context
// redux#next has the hooks to create a context-aware store, but is not released yet

// export const useStore = createStoreHook(KirbyReduxContext);
// export const useDispatch = createDispatchHook(KirbyReduxContext);
// export const useSelector = createSelectorHook(KirbyReduxContext);
// TOOD(dankins): reexporting these for now, but this is bad
export { useSelector, useStore, useDispatch };

export interface KirbyProviderProps {
  config: any;
  plugins: ParentPlugin[];
}
export const KirbyProvider: React.FunctionComponent<KirbyProviderProps> = ({ plugins, children, config }) => {
  const [context, _] = React.useState<IKirbyContext>(startingContext);

  React.useMemo(() => {
    kirby.initialize(plugins, config);
  }, [plugins, config]);

  return (
    <>
      <KirbyContext.Provider value={context}>
        <Provider store={kirby.redux}>{children}</Provider>
      </KirbyContext.Provider>
    </>
  );
};
