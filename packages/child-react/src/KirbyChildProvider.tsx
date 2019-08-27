import * as React from "react";
// @ts-ignore: @types/react-redux doesn't have create*Hook yet
import { Provider, createStoreHook, createDispatchHook, createSelectorHook } from "react-redux";
import { ThemeProvider } from "styled-components";
import { ChildCore, ChildPlugin } from "@kirby-web3/child-core";
import { Theme, DefaultTheme } from "./Theme";

export interface KirbyChildProviderProps {
  theme?: Theme;
  plugins: ChildPlugin[];
  config?: any;
}

export interface ICoreContext {
  core: ChildCore;
  store: any;
}
const core = new ChildCore();
const startingContext = { core, store: core.redux, storeState: {} };
export const CoreContext = React.createContext<ICoreContext>(startingContext);

export const useStore = createStoreHook(CoreContext);
export const useDispatch = createDispatchHook(CoreContext);
export const useSelector = createSelectorHook(CoreContext);

export const KirbyChildProvider: React.FC<KirbyChildProviderProps> = ({ plugins, theme, children, config }) => {
  const [context, _] = React.useState<ICoreContext>(startingContext);

  React.useMemo(() => {
    core.initialize(plugins, config || {}).catch(err => {
      console.log("error initializing kirby!", err);
    });
  }, [plugins, config]);

  return (
    <ThemeProvider theme={theme || DefaultTheme}>
      <CoreContext.Provider value={context}>
        <Provider store={core.redux}>
          <div>{children}</div>
        </Provider>
      </CoreContext.Provider>
    </ThemeProvider>
  );
};
