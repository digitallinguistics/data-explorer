import browserslist                  from 'browserslist'
import { build }                     from 'esbuild'
import { env }                       from '../config/app.js'
import { esbuildPluginBrowserslist } from 'esbuild-plugin-browserslist'
import { fileURLToPath }             from 'url'
import path                          from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const pagesDir   = path.join(__dirname, `../pages`)

const config = {
  bundle:      true,
  entryPoints: [path.join(pagesDir, `Lexemes/Lexemes.js`)],
  format:      `esm`,
  minify:      env === `production`,
  outdir:      path.join(__dirname, `../public/scripts`),
  plugins:     [esbuildPluginBrowserslist(browserslist())],
  sourcemap:   env === `production` ? true : `inline`,
}

export default async function buildJS() {
  await build(config)
}
