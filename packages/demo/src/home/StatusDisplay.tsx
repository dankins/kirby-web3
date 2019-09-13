import * as React from "react";
import { CenteredTextBlock, FocusWord } from "../components/text";
import { colors } from "../components/colors";

export interface StatusDisplayProps {
  account: string;
  balance: number;
  block: string;
  network: string;
}

export const StatusDisplay: React.FunctionComponent<StatusDisplayProps> = ({ account, balance, block, network }) => {
  return (
    <>
      <CenteredTextBlock>
        Demo
        <FocusWord color={colors.pink}>Kirby</FocusWord>
        dApp on the
        <FocusWord color={colors.blue}>{network}</FocusWord>
        network
      </CenteredTextBlock>
      <CenteredTextBlock>
        Connected as
        <FocusWord color={colors.purple}>{account}</FocusWord>
      </CenteredTextBlock>
      <CenteredTextBlock>
        Your balance is
        <FocusWord color={colors.green}>{balance / 10 ** 18}ETH</FocusWord>
      </CenteredTextBlock>
      <CenteredTextBlock>
        <FocusWord color={colors.orange}>{block}</FocusWord>
        is the most recent block
      </CenteredTextBlock>
    </>
  );
};
