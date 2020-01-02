import * as React from "react";
import { CoreContext, CenteredPage, useKirbySelector } from "@kirby-web3/child-react";
import { RouteComponentProps } from "@reach/router";
import { ViewPlugin } from "@kirby-web3/child-core";
import { TrustedWebChildPlugin, Profile, CurrentUser, AuthenticationResult } from "@kirby-web3/plugin-trustedweb";
import { Signup } from "./trustedweb/Signup";
import { Login } from "./trustedweb/Login";
import { SelectProfile } from "./trustedweb/SelectProfile";
import { EthereumChildPlugin } from "@kirby-web3/plugin-ethereum";
import { ProfileHeader } from "./trustedweb/ProfileHeader";
import { Button } from "../common/Button";

export const Authenticate: React.FC<RouteComponentProps> = ({ location }) => {
  const ctx = React.useContext(CoreContext);
  const trustedweb = ctx.core.plugins.trustedweb as TrustedWebChildPlugin;
  const viewPlugin = ctx.core.plugins.view as ViewPlugin;

  const parentDomain = useKirbySelector((state: any) => state.iframe.parentDomain);
  const requestID = useKirbySelector((state: any) => {
    if (state.view && state.view.queue && state.view.queue[0]) {
      return state.view.queue[0].data.requestID;
    }
  });

  const profiles: Profile[] = useKirbySelector((state: any) => {
    if (!state.trustedweb.currentUser) {
      return;
    }
    return state.trustedweb.currentUser.profiles;
  });

  const currentUser: CurrentUser | undefined = useKirbySelector((state: any) => state.trustedweb.currentUser);

  const [view, setView] = React.useState("login");

  React.useEffect(() => {
    if (requestID) {
      viewPlugin.onParentClick(() => {
        trustedweb.cancelAuthenticate(requestID);
        viewPlugin.completeView();
      });
    }
  }, [ctx, requestID, viewPlugin, trustedweb]);

  if (!currentUser) {
    if (view === "login") {
      return (
        <CenteredPage>
          <Login plugin={trustedweb} goToSignup={() => setView("signup")} />
        </CenteredPage>
      );
    } else {
      return (
        <CenteredPage>
          <Signup plugin={trustedweb} goToLogin={() => setView("login")} />
        </CenteredPage>
      );
    }
  }

  if (!currentUser.selectedProfile || view === "profiles") {
    return (
      <CenteredPage>
        <SelectProfile
          profiles={profiles}
          onProfileSelected={onProfileSelected}
          createProfile={name => trustedweb.createProfile(name)}
        />
      </CenteredPage>
    );
  }

  async function doAuthentication(): Promise<void> {
    const ethPlugin = ctx.core.plugins.ethereum as EthereumChildPlugin;

    await ethPlugin.setPrivateKeyProvider(currentUser!.selectedProfile!.privateKey, "rinkeby");
    console.log("web3", ethPlugin.web3);
    const accounts = await (ethPlugin.web3 as any).eth.getAccounts();
    console.log("accounts", accounts);
    const signer = accounts[0];
    const message = `Authenticate to ${parentDomain} @ ${new Date().toISOString()}`;
    const signature = await (ethPlugin.web3 as any).eth.personal.sign(message, signer);
    const result: AuthenticationResult = { did: "did:ethr:" + signer, message, signature };
    console.log("signature", result);

    await trustedweb.authenticate(requestID, result);
    viewPlugin.completeView();
  }

  async function onProfileSelected(selectedProfile: Profile): Promise<Profile> {
    await trustedweb.changeProfile(selectedProfile);
    setView("default");
    return selectedProfile;
  }

  return (
    <CenteredPage>
      <ProfileHeader profile={currentUser!.selectedProfile} onProfileChangeRequest={() => setView("profiles")} />

      <div>App is requesting to authenticate</div>
      <Button onClick={doAuthentication}>Authenticate</Button>
    </CenteredPage>
  );
};
