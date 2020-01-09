import * as React from "react";
import { CoreContext } from "@kirby-web3/child-react";
import { TrustedWebChildPlugin } from "@kirby-web3/plugin-trustedweb";
import { Login } from "./Login";
import { Upgrade } from "./Upgrade";

export const EphemeralUpgrade: React.FC = () => {
  const [view, setView] = React.useState("start");
  const ctx = React.useContext(CoreContext);
  const trustedweb = ctx.core.plugins.trustedweb as TrustedWebChildPlugin;

  switch (view) {
    case "loading":
      return <div>loading...</div>;
    case "login":
      return <Login plugin={trustedweb} goToSignup={() => setView("upgrade")} />;
    case "upgrade":
      return <Upgrade plugin={trustedweb} goToLogin={() => setView("login")} />;
    case "start":
      return (
        <div>
          <div>
            <span>Your trusted web account is temporary</span>
            <button onClick={() => setView("upgrade")}>Upgrade account</button>
          </div>
          <div>
            <button onClick={() => setView("login")}>I already have an account</button>
          </div>
        </div>
      );
    default:
      return <div>unknown view</div>;
  }
};
