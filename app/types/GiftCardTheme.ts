export const GiftCardThemes = [
  "generic",
  "birthday",
  "christmas",
  "christmas-2",
] as const;
export type GiftCardTheme = typeof GiftCardThemes[number];
