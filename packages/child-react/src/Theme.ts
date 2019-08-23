export interface Theme {
  headingFont: string;
  headingColor: string;
  subHeadingColor: string;
}
export const DefaultTheme: Theme = {
  headingFont: "arial",
  headingColor: "#000",
  subHeadingColor: "#555555",
};

export const overrideTheme = (input: Partial<Theme>): Theme => {
  return { ...DefaultTheme, ...input };
};
