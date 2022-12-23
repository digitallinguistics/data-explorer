import browserslist                  from 'browserslist'
import { build }                     from 'esbuild'
import { esbuildPluginBrowserslist } from 'esbuild-plugin-browserslist'
import { fileURLToPath }             from 'url'
import path                          from 'path'
import recurse                       from 'readdirp'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const mainDir    = path.join(__dirname, `../layouts/main`)
const pagesDir   = path.join(__dirname, `../pages`)
const scriptsDir = path.join(__dirname, `../public/scripts`)

const isProduction = process.env.NODE_ENV === `production`

const baseConfig = {
  bundle:    true,
  format:    `esm`,
  minify:    isProduction,
  plugins:   [esbuildPluginBrowserslist(browserslist())],
  sourcemap:  isProduction ? true : `inline`,
}

const recurseOptions = {
  depth:      1,
  fileFilter: `*-client.js`,
}

async function buildJSFiles(dir) {
  for await (const entry of recurse(dir, recurseOptions)) {

    const scriptName = entry.basename.replace(`-client`, ``)

    const recurseConfig = Object.assign({}, baseConfig, {
      entryPoints: [entry.fullPath],
      outfile:     path.join(scriptsDir, scriptName),
    })

    await build(recurseConfig)

  }
}

export default async function buildJS() {
  await buildJSFiles(mainDir)
  await buildJSFiles(pagesDir)
}
