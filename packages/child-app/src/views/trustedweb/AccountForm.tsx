import * as React from "react";
import styled from "styled-components";

import { Button } from "../../common/Button";

const StyledAccountForm = styled.form`
  display: flex;
  flex-direction: column;

  > input {
    padding: 5px;
    font-size: 16px;
    line-height: 120%;
    margin: 10px 0px 0px 0;
  }
`;

export interface AccountFormProps {
  cta: string;
  checkPassword(username: string, password: string): Promise<void>;
  onSuccess?(): void;
}

export const AccountForm: React.FunctionComponent<AccountFormProps> = ({ cta, checkPassword, onSuccess }) => {
  const emailRef = React.useRef<any>(null);
  const passwordRef = React.useRef<any>(null);

  const [error, setError] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState<boolean>(false);

  async function doOnSubmit(e: any): Promise<void> {
    e.preventDefault();
    setError(undefined);
    if (emailRef === null || passwordRef === null) {
      throw new Error("null ref");
    }

    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    setLoading(true);
    try {
      await checkPassword(email, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.log("err", err);
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <StyledAccountForm>
      <input type="text" name="email" ref={emailRef} placeholder="Email Address" disabled={loading} />
      <input type="password" name="password" ref={passwordRef} placeholder="Password" disabled={loading} />
      <Button onClick={doOnSubmit} disabled={loading}>
        {cta}
      </Button>
      {error ? <div>{error}</div> : undefined}
      {loading ? <div>loading...</div> : undefined}
    </StyledAccountForm>
  );
};
