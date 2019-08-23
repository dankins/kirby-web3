import * as React from "react";
import styled from "styled-components";
import { Heading, SubHeading } from "../common/Heading";
import { MetaMask } from "../common/logos/Metamask";
import { Portis } from "../common/logos/Portis";
import { Burner } from "../common/logos/Burner";

const StyledDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #ebebeb;
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 #e6e6e6;
  width: 311px;
  height: 117px;
  margin-top: 15px;
  cursor: pointer;
  :hover {
    border: 1px solid #2b56ff;
  }
  > div:first-child {
    margin: 18px;
  }
  > div:nth-child(2) {
    flex-grow: 1;
  }
`;
const OvalImage = styled.div`
  background-color: #f1f1f1;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  > svg {
    height: 40px;
    width: 40px;
  }
`;

export interface LogInWithProps {
  provider: string;
  helpText: string;
  logo: JSX.Element;
  onSelection(selection: string): void;
}

export const LogInWith: React.FC<LogInWithProps> = ({ logo, provider, helpText, onSelection }) => {
  return (
    <StyledDiv onClick={() => onSelection(provider)}>
      <OvalImage>{logo}</OvalImage>
      <div>
        <Heading>Log in with {provider}</Heading>
        <SubHeading>{helpText}</SubHeading>
      </div>
    </StyledDiv>
  );
};

export interface ProviderProps {
  onSelection(selection: string): void;
}

export const LogInWithMetaMask: React.FC<ProviderProps> = props => {
  return (
    <LogInWith
      onSelection={option => props.onSelection(option)}
      logo={<MetaMask />}
      provider={"MetaMask"}
      helpText="Use any MetaMask to log in."
    />
  );
};

export const LogInWithPortis: React.FC<ProviderProps> = props => {
  return (
    <LogInWith
      onSelection={option => props.onSelection(option)}
      logo={<Portis />}
      provider={"Portis"}
      helpText="Use Portis to log in from any device."
    />
  );
};

export const LogInWithBurner: React.FC<ProviderProps> = props => {
  return (
    <LogInWith
      onSelection={option => props.onSelection(option)}
      logo={<Burner />}
      provider={"Burner Wallet"}
      helpText="Use Burner Wallet for a temporary identity."
    />
  );
};
