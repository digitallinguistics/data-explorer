export default function getDefaultLanguage(mls, lang) {
  return typeof mls === `string` ? mls : mls[lang] ?? Object.values(mls)[0] ?? mls.eng ?? mls.en
}
