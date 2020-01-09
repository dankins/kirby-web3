import * as React from "react";
import styled from "styled-components";
import { AccountSwitcher } from "./AccountSwitcher";

const NavContainer = styled.div`
  padding: 5px;
  min-height: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  background-color: pink;
  > :nth-child(2) {
    flex-grow: 1;
  }
`;
const Title = styled.span`
  font-size: 20px;
`;

export const Nav: React.FunctionComponent = () => {
  return (
    <NavContainer>
      <Title>Kirby Framework</Title>
      <span></span>
      <AccountSwitcher />
    </NavContainer>
  );
};
