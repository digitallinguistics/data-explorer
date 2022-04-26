import convertLESS       from './convertLESS.js'
import { fileURLToPath } from 'url'
import path              from 'path'
import recurse           from 'readdirp'

import { readFile, writeFile } from 'fs/promises'

async function buildCSSPartial(lessPath) {

  const less          = await readFile(lessPath, `utf8`)
  const css           = await convertLESS(less)
  const html          = `<style>${ css }</style>`
  const { dir, name } = path.parse(lessPath)
  const partialPath   = path.join(dir, `${ name }-styles.hbs`)

  await writeFile(partialPath, html, `utf8`)

}

export default async function buildCSS() {

  // Build CSS partial for main layout

  const __filename        = fileURLToPath(import.meta.url)
  const __dirname         = path.dirname(__filename)
  const layoutLESSPath    = path.join(__dirname, `../layout/layout.less`)

  await buildCSSPartial(layoutLESSPath)

  // Build CSS partials for individual pages

  const pagesPath = path.join(__dirname, `../pages`)

  const recurseOptions = {
    depth:      10,
    fileFilter: [`*.less`],
  }

  for await (const entry of recurse(pagesPath, recurseOptions)) {
    await buildCSSPartial(entry.fullPath)
  }

}
