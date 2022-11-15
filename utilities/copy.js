/**
 * Creates a deep copy of an object.
 * @param {Object} obj The Object to copy.
 * @returns Object
 */
export default function copy(obj) {
  return JSON.parse(JSON.stringify(obj))
}
