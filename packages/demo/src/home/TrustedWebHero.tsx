import * as React from "react";
import styled from "styled-components";

const Container = styled.div``;

const WebVersions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  > div {
    font-size: 32px;
  }
  > div > u {
    color: red;
  }
`;

const Quote = styled.div`
  margin: 20px;
`;

export const TrustedWebHero: React.FC = () => {
  return (
    <Container>
      <WebVersions>
        <div>
          Web 1.0 is <i>information</i>
        </div>
        <div>
          Web 2.0 is <i>social</i>
        </div>
        <div>
          <strong>
            Web 3.0 is <i>trusted</i>
          </strong>
        </div>
      </WebVersions>
      <Quote>
        <small>“The Web is broken — or incomplete — because it has no native constructs for identity or money.”</small>
        <span>
          <a href="https://media.consensys.net/joe-lubins-full-speech-from-devcon-5-how-we-get-to-a-decentralized-world-wide-web-1f83b35b2a0c">
            Joe Lubin
          </a>
        </span>
      </Quote>
      <div>
        Kirby helps you build apps for the <i>trusted web</i>. It provides <a href="#">decentralized identity</a>{" "}
        constructs and zero-friction <a href="#">Ethereum wallets</a>.
      </div>
    </Container>
  );
};
