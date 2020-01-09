import * as React from "react";
import styled from "styled-components";

import { RouteComponentProps } from "@reach/router";
import { TrustedWebHero } from "./TrustedWebHero";
import { Nav } from "./Nav";
import { WhoYouAre } from "./WhoYouAre";

const HomeContainer = styled.div`
  margin: 10px;

  display: flex;
  flex-direction: column;
  align-items: center;
  > div {
    max-width: 750px;
    @media (max-width: 400px) {
      max-width: 375px;
    }
  }
`;

export const Home: React.FunctionComponent<RouteComponentProps> = () => {
  return (
    <div>
      <Nav />
      <HomeContainer>
        <div>
          <TrustedWebHero />
          <WhoYouAre />
        </div>
      </HomeContainer>
    </div>
  );
};
