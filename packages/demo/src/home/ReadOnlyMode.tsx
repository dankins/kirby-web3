import * as React from "react";
import { CenteredTextBlock, FocusWord } from "../components/text";
import { colors } from "../components/colors";

export const ReadOnlyMode = () => {
  return (
    <>
      <CenteredTextBlock>
        You are in
        <FocusWord color={colors.red}>read-only</FocusWord>
        mode
      </CenteredTextBlock>
      <CenteredTextBlock>
        Click
        <FocusWord color={colors.lightBlue}>Connect</FocusWord>
        to select a web3 provider
      </CenteredTextBlock>
    </>
  );
};
