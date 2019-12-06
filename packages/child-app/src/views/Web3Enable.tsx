import * as React from "react";
import queryString from "query-string";
import {
  LogInWithMetaMask,
  LogInWithPortis,
  LogInWithBurner,
  CoreContext,
  useSelector,
  CenteredPage,
} from "@kirby-web3/child-react";
import { EthereumChildPlugin, Network } from "@kirby-web3/plugin-ethereum";
import { RouteComponentProps } from "@reach/router";
import { ViewPlugin } from "@kirby-web3/child-core";

export const Web3Enable: React.FC<RouteComponentProps> = ({ location }) => {
  const ctx = React.useContext(CoreContext);
  const view = ctx.core.plugins.view as ViewPlugin;
  const hasInjectedWeb3 = (window as any).ethereum;
  const [status, setStatus] = React.useState("provided");

  const requestID = useSelector((state: any) => {
    if (state.view && state.view.queue && state.view.queue[0]) {
      return state.view.queue[0].data.requestID;
    }
  });

  const [network, providerPreference] = React.useMemo<[Network, string]>(() => {
    const queryParams = queryString.parse(location!.search);
    return [queryParams.network as Network, queryParams.providerPreference as string];
  }, [location]);

  React.useEffect(() => {
    if (providerPreference) {
      selection(providerPreference as string).catch(err => console.log("error with selection", err));
    } else {
      setStatus("select");
    }
  }, []);

  React.useEffect(() => {
    if (requestID) {
      view.onParentClick(() => {
        (ctx.core.plugins.ethereum as EthereumChildPlugin).cancelEnableWeb3(requestID);
        (ctx.core.plugins.view as ViewPlugin).completeView();
      });
    }
  }, [ctx, requestID]);

  async function selection(provider: string): Promise<void> {
    const ethPlugin = ctx.core.plugins.ethereum as EthereumChildPlugin;
    console.log("selected:", provider);
    try {
      setStatus("enabling provider");
      await ethPlugin.enableWeb3(requestID, provider, network);
      setStatus("done");
      (ctx.core.plugins.view as ViewPlugin).completeView();
    } catch (err) {
      console.log("error with enableWeb3: ", err);
      (ctx.core.plugins.view as ViewPlugin).completeView();
    }
  }
  if (status === "provided") {
    return <></>;
  } else if (status === "enabling provider") {
    return <CenteredPage>loading</CenteredPage>;
  }
  return (
    <CenteredPage>
      <LogInWithMetaMask onSelection={selection} />
      <LogInWithPortis onSelection={selection} />
      <LogInWithBurner onSelection={selection} />
    </CenteredPage>
  );
};
