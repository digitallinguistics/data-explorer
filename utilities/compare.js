/**
 * A generic comparator function, for use with the sort method. Works with Strings and Numbers.
 * @param  {Any}     a First item to be compared
 * @param  {Any}     b Second item to be compared
 * @return {Integer}   Returns 1 if the first item is greater, -1 if the first item is lesser, and 0 if the two items are the same.
 * @example
 * items.sort((a, b) => compare(a.year, b.year) || compare(a.title, b.title));
 */
export default function compare(a, b) {
  if (a < b) return -1
  if (a > b) return +1
  return 0
}
