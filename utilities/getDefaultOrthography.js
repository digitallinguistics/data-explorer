export default function getDefaultOrthography(txn, ortho) {
  return txn[ortho] ?? Object.values(txn)[0] ?? txn.default
}
