import CleanCSS          from 'clean-css'
import { fileURLToPath } from 'url'
import less              from 'less'
import path              from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const options = {
  paths: [
    path.join(__dirname, `../components`),
    path.join(__dirname, `../layout`),
    path.join(__dirname, `../pages`),
    path.join(__dirname, `../styles`),
    path.join(__dirname, `../node_modules/@digitallinguistics/design`),
    path.join(__dirname, `../node_modules/@digitallinguistics/design/components`),
    path.join(__dirname, `../node_modules/@digitallinguistics/design/global`),
    path.join(__dirname, `../node_modules/@digitallinguistics/styles/components`),
  ],
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
