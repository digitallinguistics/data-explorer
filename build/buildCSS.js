import convertLESS       from './convertLESS.js'
import { fileURLToPath } from 'url'
import fs                from 'fs-extra'
import path              from 'path'
import recurse           from 'readdirp'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const { readFile, outputFile } = fs

async function buildCSSFile(lessPath) {

  const less      = await readFile(lessPath, `utf8`)
  const css       = await convertLESS(less)
  const { name }  = path.parse(lessPath)
  const stylesDir = path.join(__dirname, `../public/styles`)
  const cssPath   = path.join(stylesDir, `${ name }.css`)

  await outputFile(cssPath, css, `utf8`)

}

export default async function buildCSS() {

  // Build CSS file for main layout

  const layoutLESSPath = path.join(__dirname, `../layouts/main/main.less`)

  await buildCSSFile(layoutLESSPath)

  // Build CSS files for individual pages

  const componentsPath = path.join(__dirname, `../components`)
  const pagesPath      = path.join(__dirname, `../pages`)

  const recurseOptions = {
    depth:      1,
    fileFilter(entry) {
      const ext = path.extname(entry.basename)
      return ext === `.less`
    },
  }

  for await (const entry of recurse(componentsPath, recurseOptions)) {
    await buildCSSFile(entry.fullPath)
  }

  for await (const entry of recurse(pagesPath, recurseOptions)) {
    await buildCSSFile(entry.fullPath)
  }

}
