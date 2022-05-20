import browserslist                  from 'browserslist'
import { build }                     from 'esbuild'
import { env }                       from '../config/app.js'
import { esbuildPluginBrowserslist } from 'esbuild-plugin-browserslist'
import { fileURLToPath }             from 'url'
import path                          from 'path'
import recurse                       from 'readdirp'
import { rename }                    from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const pagesDir   = path.join(__dirname, `../pages`)
const scriptsDir = path.join(__dirname, `../public/scripts`)

const config = {
  bundle:      true,
  entryPoints: [path.join(pagesDir, `Lexemes/Lexemes-client.js`)],
  format:      `esm`,
  minify:      env === `production`,
  outdir:      scriptsDir,
  plugins:     [esbuildPluginBrowserslist(browserslist())],
  sourcemap:   env === `production` ? true : `inline`,
}

async function renameFiles() {
  for await (const entry of recurse(scriptsDir)) {
    await rename(entry.fullPath, entry.fullPath.replace(`-client`, ``))
  }
}

export default async function buildJS() {
  await build(config)
  await renameFiles()
}
