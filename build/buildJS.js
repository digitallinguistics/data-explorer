import browserslist                  from 'browserslist'
import { build }                     from 'esbuild'
import { env }                       from '../config/app.js'
import { esbuildPluginBrowserslist } from 'esbuild-plugin-browserslist'
import { fileURLToPath }             from 'url'
import path                          from 'path'
import recurse                       from 'readdirp'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const pagesDir   = path.join(__dirname, `../pages`)
const scriptsDir = path.join(__dirname, `../public/scripts`)

const baseConfig = {
  bundle:    true,
  format:    `esm`,
  minify:    env === `production`,
  plugins:   [esbuildPluginBrowserslist(browserslist())],
  sourcemap: env === `production` ? true : `inline`,
}

const recurseOptions = {
  depth:      1,
  fileFilter: `*-client.js`,
}

export default async function buildJS() {
  for await (const entry of recurse(pagesDir, recurseOptions)) {

    const scriptName = entry.basename.replace(`-client`, ``)

    const config = Object.assign({}, baseConfig, {
      entryPoints: [entry.fullPath],
      outfile:     path.join(scriptsDir, scriptName),
    })

    await build(config)

  }
}
