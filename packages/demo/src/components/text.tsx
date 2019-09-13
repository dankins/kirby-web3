import * as React from "react";
import styled from "styled-components";
import { colors } from "./colors";

export interface FocusWordProps {
  color: colors;
}
export const FocusWord = styled.span<FocusWordProps>`
  padding: 10px;
  color: ${(props: FocusWordProps) => props.color};
`;

export const CenteredTextBlock = styled.div`
  margin-top: 20px;
  text-align: center;
  font-size: 28px;
`;
