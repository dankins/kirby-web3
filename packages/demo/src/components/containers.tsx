import styled from "styled-components";

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  > div:first {
    align-self: flex-start;
  }
  > div:last {
    align-self: flex-end;
  }
`;

export const HeaderRow = styled(Row)`
  margin: 10px;
  flex-direction: row-reverse;
`;

export const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
