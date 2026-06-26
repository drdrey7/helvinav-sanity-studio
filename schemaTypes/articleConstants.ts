export const languageOptions = [
  { title: "English", value: "en" },
  { title: "French", value: "fr" },
  { title: "German", value: "de" },
  { title: "Portuguese", value: "pt" },
] as const;

export const categoryOptions = [
  { title: "Money", value: "money" },
  { title: "Home", value: "home" },
  { title: "Insurances", value: "insurances" },
  { title: "Swiss Life", value: "swiss-life" },
] as const;

export const reservedGuideSlugs = [
  "guides",
  "money-taxes",
  "home-rent",
  "insurances",
  "swiss-life",
  "schools",
  "permits",
  "cantons",
  "swiss-retirement",
  "retraite-suisse",
  "pensionierung-schweiz",
  "reforma-suica",
] as const;

export const authorDefaults = {
  authorName: "André",
  authorDisplayName: "André",
  authorSlug: "andre",
} as const;

