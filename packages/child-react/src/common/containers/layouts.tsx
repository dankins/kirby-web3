import styled from "styled-components";

export const PageLayout = styled.div`
  background-color: #ffffff;
  border-radius: 4px 4px 4px;
  box-shadow: 0 2px 8px 0 rgba(128, 128, 128, 0.5);
  @media (min-width: 600px) {
    width: 375px;
    height: 500px;
  }
  @media (max-width: 600px) {
    width: 100%
    height: 100%
  }

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
`;

export const CenteredPage = styled(PageLayout)`
  flex-direction: column;
  align-items: center;
  padding: 5px;
`;
