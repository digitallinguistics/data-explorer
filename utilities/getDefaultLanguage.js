export default function getDefaultLanguage(mls, lang) {
  return mls[lang] ?? Object.entries(mls)[0]
}
