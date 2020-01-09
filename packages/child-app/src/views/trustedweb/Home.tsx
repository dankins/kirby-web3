import * as React from "react";
import { CoreContext, CenteredPage, useKirbySelector } from "@kirby-web3/child-react";
import { RouteComponentProps } from "@reach/router";
import { ViewPlugin } from "@kirby-web3/child-core";
import { TrustedWebChildPlugin, Profile, CurrentUser } from "@kirby-web3/plugin-trustedweb";
import { ProfileHeader } from "./ProfileHeader";
import { SelectProfile } from "./SelectProfile";
import { EphemeralUpgrade } from "./EphemeralUpgrade";

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
    return <CenteredPage>account not unlocked</CenteredPage>;
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

  function logout(): void {
    trustedweb.logout();
  }

  return (
    <CenteredPage>
      <ProfileHeader profile={currentUser!.selectedProfile} onProfileChangeRequest={() => setView("profiles")} />
      {currentUser && currentUser.ephemeral ? <EphemeralUpgrade /> : undefined}
      {currentUser ? <button onClick={logout}>Logout</button> : undefined}
    </CenteredPage>
  );
};
