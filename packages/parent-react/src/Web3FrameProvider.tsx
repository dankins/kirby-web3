import * as React from "react";
import { Kirby, ParentPlugin } from "@kirby-web3/parent-core";
// @ts-ignore: @types/react-redux doesn't have create*Hook yet
import { Provider, ReactReduxContextValue, createStoreHook, createDispatchHook, createSelectorHook } from "react-redux";

export interface IKirbyContext extends ReactReduxContextValue {
  kirby: Kirby;
}

const kirby = new Kirby();
const startingContext: IKirbyContext = { kirby, store: kirby.redux, storeState: {} };
export const ReduxContext = React.createContext<ReactReduxContextValue>(startingContext);
export const KirbyContext = React.createContext(startingContext);

export const useStore = createStoreHook(KirbyContext);
export const useDispatch = createDispatchHook(KirbyContext);
export const useSelector = createSelectorHook(KirbyContext);

export interface KirbyProviderProps {
  config: any;
  plugins: ParentPlugin[];
}
export const KirbyProvider: React.FunctionComponent<KirbyProviderProps> = ({ plugins, children, config }) => {
  const [context, _] = React.useState<IKirbyContext>(startingContext);

  React.useMemo(() => {
    kirby.initialize(plugins, config).catch(err => {
      console.log("error initializing kirby!", err);
    });
  }, [plugins, config]);

  return (
    <>
      <KirbyContext.Provider value={context}>
        <Provider context={ReduxContext} store={kirby.redux}>
          {children}
        </Provider>
      </KirbyContext.Provider>
    </>
  );
};
