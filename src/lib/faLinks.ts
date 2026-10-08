/** Fantasy Apples destinations. The app (`../sil009`) serves its own legal pages. */
export const FA_APP_URL = "https://fantasyapples.com";

export const FA_LEGAL_LINKS = [
  { href: `${FA_APP_URL}/privacy.html`, label: "Privacy Policy" },
  { href: `${FA_APP_URL}/terms.html`, label: "Terms & Conditions" },
] as const;
