export interface Theme {
  headingFont: String;
  headingColor: String;
  subHeadingColor: String;
}
export const DefaultTheme: Theme = {
  headingFont: "arial",
  headingColor: "#000",
  subHeadingColor: "#555555",
};

export const overrideTheme = function(input: Partial<Theme>): Theme {
  return { ...DefaultTheme, ...input };
};
