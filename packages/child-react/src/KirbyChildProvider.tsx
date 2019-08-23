import * as React from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import { ChildCore, ChildPlugin } from "@kirby-web3/child-core";
import { Theme, DefaultTheme } from "./Theme";

export interface KirbyChildProviderProps {
  theme?: Theme;
  plugins: ChildPlugin[];
}

export const CoreContext = React.createContext<ChildCore | null>(null);

export const KirbyChildProvider: React.FC<KirbyChildProviderProps> = ({ plugins, theme, children }) => {
  const [core, setCore] = React.useState();
  const [store, setStore] = React.useState();
  const [loading, setLoading] = React.useState();

  React.useMemo(() => {
    const newCore = new ChildCore();
    setLoading(true);
    setCore(newCore);
    setStore(newCore.redux);
    newCore
      .initialize(plugins, {})
      .then(() => {
        setLoading(false);
      })
      .catch(err => {
        console.log("error initialzing", err);
      });
  }, [plugins]);

  return (
    <ThemeProvider theme={theme || DefaultTheme}>
      <Provider store={store}>
        <CoreContext.Provider value={core}>
          <div>{children}</div>
        </CoreContext.Provider>
      </Provider>
    </ThemeProvider>
  );
};
