import getDefaultOrthography from './getDefaultOrthography.js'
import localeSort            from './localeSort.js'

const tokensRegExp = /(?:^[-=*(]+)|(?:[-=*)]+&)/gu

export default function compareLemmas(a, b) {
  return localeSort(
    getDefaultOrthography(a.lemma, a.language.defaultOrthography).replaceAll(tokensRegExp, ``),
    getDefaultOrthography(b.lemma, a.language.defaultOrthography).replaceAll(tokensRegExp, ``),
  )
}
