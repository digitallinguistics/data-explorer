import convertLESS       from './convertLESS.js'
import { fileURLToPath } from 'url'
import path              from 'path'

import { readFile, writeFile } from 'fs/promises'

export default async function buildCSS() {

  const __filename     = fileURLToPath(import.meta.url)
  const __dirname      = path.dirname(__filename)
  const layoutLESSPath = path.join(__dirname, `../layout/index.less`)
  const layoutCSSPath  = path.join(__dirname, `../layout/index.css`)
  const less           = await readFile(layoutLESSPath, `utf8`)
  const css            = await convertLESS(less)

  await writeFile(layoutCSSPath, css, `utf8`)

}