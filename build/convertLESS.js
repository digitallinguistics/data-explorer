import CleanCSS from 'clean-css'
import less     from 'less'

const options = {
  paths: [],
}

const minifier = new CleanCSS

/**
 * Converts LESS text to CSS text
 * @param  {String} data The LESS text to convert.
 * @return {Promise<String>}
 */
export default async function convertLESS(data) {
  const { css } = await less.render(data, options)
  const { styles: minifiedCSS } = minifier.minify(css)
  return minifiedCSS
}
