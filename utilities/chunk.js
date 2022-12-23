// https://github.com/30-seconds/30-seconds-of-code/blob/master/snippets/chunk.md
export default function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size))
}
