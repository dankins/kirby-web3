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

export const Signup: React.FunctionComponent<SignupProps> = ({ plugin, goToLogin }) => {
  async function onSubmit(email: string, password: string): Promise<void> {
    const result = await plugin.signup(email, password);
    console.log({ result });
  }

  function onSuccess(): void {
    console.log("signed up");
  }

  return (
    <Container>
      <div>Enter your username and password so you can log in across devices:</div>
      <AccountForm cta="Sign Up" checkPassword={onSubmit} onSuccess={onSuccess} />
      <div>
        Already have an account? <LinkButton onClick={goToLogin}>Click to log in</LinkButton>
      </div>
    </Container>
  );
};
