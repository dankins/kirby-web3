import styled from "styled-components";

export const Button = styled.button`
  padding: 5px;
  margin: 0;
  cursor: pointer;
`;

export const LinkButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  display: inline;
  margin: 0;
  padding: 0;

  :hover,
  :focus {
    text-decoration: none;
  }
`;
