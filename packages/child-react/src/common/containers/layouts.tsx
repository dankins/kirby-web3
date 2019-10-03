import styled from "styled-components";

export const PageLayout = styled.div`
  background-color: #ffffff;
  border-radius: 4px 4px 4px;
  box-shadow: 0 2px 8px 0 rgba(128, 128, 128, 0.5);

  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
  padding: 5px;
  padding-bottom: 20px;
`;

export const CenteredPage = styled(PageLayout)`
  flex-direction: column;
  align-items: center;
  padding: 5px;
`;
