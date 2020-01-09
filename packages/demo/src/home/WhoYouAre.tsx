import * as React from "react";
import styled from "styled-components";
import {
  useKirbySelector,
  KirbyEthereumContext,
  KirbyEthereum,
  AuthenticationResult,
} from "@kirby-web3/ethereum-react";

const Container = styled.div`
  margin-top: 20px;
`;

const DID = styled.span`
  background-color: #dfdfdf;
  overflow-wrap: anywhere;
  padding: 4px;
`;

export const WhoYouAre: React.FunctionComponent = () => {
  const kirby = React.useContext<KirbyEthereum>(KirbyEthereumContext);
  const auth: AuthenticationResult = useKirbySelector((state: any) => state.trustedweb.auth);

  async function authenticate(): Promise<void> {
    try {
      kirby.trustedweb.requestAuthentication();
    } catch (err) {
      console.log("error changing account", err);
    }
  }

  let introText;
  if (!auth) {
    introText = (
      <>
        <p>
          Decentralized identities give you control over your identity and your privacy. Right now, this app doesn't
          know anything about you.
        </p>
        <p>
          In the trusted web, authenticating is similar to accepting cookies on a site. If you would like to
          authenticate with this site, click below:
        </p>
        <button onClick={authenticate}>Accept</button>
      </>
    );
  } else {
    let ephemeralText;
    if (auth.ephemeral) {
      ephemeralText = (
        <span>
          Looks like you are using an ephemeral account. That just means that it was created in your local storage and
          can be upgraded to a persistent account when you're ready. If you would like to do it now, click your avatar
          in the top right corner, and choose "Upgrade".
        </span>
      );
    } else {
      ephemeralText = (
        <span>
          Looks like you have upgraded your ephemeral account! This account stores its data on an{" "}
          <a href="#">identity hub</a> and can log in across devices.
        </span>
      );
    }
    introText = (
      <>
        <p>
          Decentralized identities give you control over your identity and your privacy. We can see that you are
          currently authenticated.
        </p>
        <p>
          This is your "decentralized identity": <DID>{auth.did}</DID>
        </p>
        <p>{ephemeralText}</p>
      </>
    );
  }

  return <Container>{introText}</Container>;
};
