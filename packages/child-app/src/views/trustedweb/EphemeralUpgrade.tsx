import * as React from "react";
import styled from "styled-components/macro";
import { CoreContext } from "@kirby-web3/child-react";
import { TrustedWebChildPlugin } from "@kirby-web3/plugin-trustedweb";
import { Login } from "./Login";
import { Upgrade } from "./Upgrade";
import { Button, LinkButton } from "../../common/Button";

const Container = styled.div`
  margin: 7px;
  padding: 4px;
  background-color: #ffe7d7;
  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    > button {
      margin-top: 7px;
    }
  }
`;

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
        <Container>
          <div>
            <div>
              <div>
                ⚠️ You are currently using a Guest account, and will be deleted if you clear your cookies. Finish
                creating your account:
              </div>
            </div>
            <Button onClick={() => setView("upgrade")}>Create Account</Button>
            <LinkButton onClick={() => setView("login")}>I already have an account</LinkButton>
          </div>
        </Container>
      );
    default:
      return <div>unknown view</div>;
  }
};
