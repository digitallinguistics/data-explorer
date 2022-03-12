import { fileURLToPath } from 'url'
import path              from 'path'
import { writeFile }     from 'fs/promises'

export default async function buildCSS() {
  const __filename    = fileURLToPath(import.meta.url)
  const __dirname     = path.dirname(__filename)
  const layoutCSSPath = path.join(__dirname, `../layout/layout.css`)
  await writeFile(layoutCSSPath, ``, `utf8`)
}
