export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const removeExtraWhiteSpaces = (text: string): string =>
  text.replace(/ +/g, " ").trim();
