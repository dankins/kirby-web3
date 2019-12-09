import * as React from "react";
import styled from "styled-components";
import { TrustedWebChildPlugin } from "@kirby-web3/plugin-trustedweb";
import { AccountForm } from "./AccountForm";
import { LinkButton } from "../../common/Button";

const LoginContainer = styled.div`
  width: 100%;
  padding: 8px;
`;

export interface LoginProps {
  plugin: TrustedWebChildPlugin;
  goToSignup(): void;
}

export const Login: React.FunctionComponent<LoginProps> = ({ plugin, goToSignup }) => {
  async function checkPassword(email: string, password: string): Promise<void> {
    const result = await plugin.login(email, password);
    console.log({ result });
  }

  return (
    <LoginContainer>
      <div>You need to unlock your account before proceeding.</div>
      <AccountForm cta="Login" checkPassword={checkPassword} />
      <div>
        Don't have an account? <LinkButton onClick={goToSignup}>Sign up to join</LinkButton>
      </div>
    </LoginContainer>
  );
};
