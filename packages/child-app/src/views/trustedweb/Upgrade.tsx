import * as React from "react";
import styled from "styled-components";
import { TrustedWebChildPlugin } from "@kirby-web3/plugin-trustedweb";
import { AccountForm } from "./AccountForm";
import { LinkButton } from "../../common/Button";

const Container = styled.div`
  width: 100%;
  padding: 8px;
`;

export interface SignupProps {
  plugin: TrustedWebChildPlugin;
  goToLogin(): void;
}

export const Upgrade: React.FunctionComponent<SignupProps> = ({ plugin, goToLogin }) => {
  async function onSubmit(email: string, password: string): Promise<void> {
    await plugin.upgradeEphemeral(email, password);
    console.log("upgrade complete");
  }

  function onSuccess(): void {
    console.log("signed up");
  }

  return (
    <Container>
      <div>Create a trusted web account so you can authenticate with </div>
      <AccountForm cta="Upgrade" checkPassword={onSubmit} onSuccess={onSuccess} />
      <div>
        Already have an account? <LinkButton onClick={goToLogin}>Click to log in</LinkButton>
      </div>
    </Container>
  );
};
