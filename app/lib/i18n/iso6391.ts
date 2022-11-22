import ISO6391 from "iso-639-1-plus";

export const getLanguageCode = (languageName: string) => {
  const code = ISO6391.getCode(languageName);
  if (!code) {
    throw new Error("Unknown language: " + languageName);
  }
  return code;
};

export const getNativeLanguageName = (languageCode: string) => {
  const nativeName = ISO6391.getNativeName(languageCode);
  if (!nativeName) {
    throw new Error("Unknown language code: " + languageCode);
  }
  return nativeName;
};

export const validateLanguageCode = (languageCode: string) => {
  return ISO6391.validate(languageCode);
};
