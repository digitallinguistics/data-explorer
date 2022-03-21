import convertLESS       from './convertLESS.js'
import { fileURLToPath } from 'url'
import path              from 'path'

import { readFile, writeFile } from 'fs/promises'

export default async function buildCSS() {

  const __filename        = fileURLToPath(import.meta.url)
  const __dirname         = path.dirname(__filename)
  const layoutLESSPath    = path.join(__dirname, `../layout/index.less`)
  const layoutPartialPath = path.join(__dirname, `../layout/style.hbs`)
  const less              = await readFile(layoutLESSPath, `utf8`)
  const css               = await convertLESS(less)
  const html              = `<style>${ css }</style>`

  await writeFile(layoutPartialPath, html, `utf8`)

}
