import * as React from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import { Core, Plugin } from "@kirby-web3/child-core";
import { Theme, DefaultTheme } from "./Theme";

export interface KirbyChildProviderProps {
  theme?: Theme;
  plugins: Plugin[];
}

export const CoreContext = React.createContext<Core | null>(null);

export const KirbyChildProvider: React.FC<KirbyChildProviderProps> = ({ plugins, theme, children }) => {
  const [core, setCore] = React.useState();
  const [store, setStore] = React.useState();
  const [loading, setLoading] = React.useState();

  React.useMemo(() => {
    const newCore = new Core(plugins);
    setLoading(true);
    setCore(newCore);
    setStore(newCore.redux);
    newCore.initialize().then(() => {
      setLoading(false);
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
