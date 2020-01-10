import * as React from "react";
import { CoreContext, CenteredPage, useKirbySelector } from "@kirby-web3/child-react";
import { RouteComponentProps } from "@reach/router";
import { ViewPlugin } from "@kirby-web3/child-core";
import { TrustedWebChildPlugin, Profile, CurrentUser } from "@kirby-web3/plugin-trustedweb";
import { ProfileHeader } from "./ProfileHeader";
import { SelectProfile } from "./SelectProfile";
import { EphemeralUpgrade } from "./EphemeralUpgrade";
import { Button, LinkButton } from "../../common/Button";
import { SyncDevice } from "./auth/SyncDevice";

export const Home: React.FC<RouteComponentProps> = ({ location }) => {
  const ctx = React.useContext(CoreContext);
  const trustedweb = ctx.core.plugins.trustedweb as TrustedWebChildPlugin;
  const viewPlugin = ctx.core.plugins.view as ViewPlugin;

  const profiles: Profile[] = useKirbySelector((state: any) => {
    if (!state.trustedweb.currentUser) {
      return;
    }
    return state.trustedweb.currentUser.profiles;
  });

  const currentUser: CurrentUser | undefined = useKirbySelector((state: any) => state.trustedweb.currentUser);

  const [view, setView] = React.useState("login");

  React.useEffect(() => {
    viewPlugin.onParentClick(() => {
      viewPlugin.completeView();
    });
  }, [ctx, viewPlugin, trustedweb]);

  async function onProfileSelected(selectedProfile: Profile): Promise<Profile> {
    await trustedweb.changeProfile(selectedProfile);
    setView("default");
    return selectedProfile;
  }

  if (!currentUser) {
    return <CenteredPage>account logged out</CenteredPage>;
  }

  if (!currentUser.selectedProfile || view === "profiles") {
    return (
      <CenteredPage>
        <SelectProfile
          profiles={profiles}
          onProfileSelected={onProfileSelected}
          createProfile={name => trustedweb.createProfile(name)}
        />
        {currentUser.ephemeral ? <EphemeralUpgrade /> : undefined}
      </CenteredPage>
    );
  }

  let body;

  if (view === "sync-device") {
    const entropy = trustedweb.getEntropy();
    body = (
      <div>
        {currentUser && !currentUser.ephemeral ? <SyncDevice entropy={entropy} cancel={() => setView("home")} /> : null}
      </div>
    );
  } else {
    body = (
      <div>
        {currentUser && !currentUser.ephemeral ? (
          <LinkButton onClick={() => setView("sync-device")}>Sync Another Device</LinkButton>
        ) : null}
      </div>
    );
  }

  return (
    <CenteredPage>
      <ProfileHeader profile={currentUser!.selectedProfile} onProfileChangeRequest={() => setView("profiles")} />
      {body}
      {currentUser && currentUser.ephemeral ? <EphemeralUpgrade /> : undefined}
    </CenteredPage>
  );
};
