/**
 * Prepares a transcription string for presentation by using non-breaking hyphens rather than regular hyphens.
 * @param   {String} str The string to prepare.
 * @returns {String}
 */
export default function prepareTranscription(str) {
  if (!str) return ``
  return str.replaceAll(/-/gu, `‑`) // use non-breaking hyphen
}
