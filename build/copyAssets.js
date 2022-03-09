/**
 * Copies any assets from dependencies (especially @digitallinguistics/design) into the project.
 */

import { fileURLToPath } from 'url'
import fs                from 'fs/promises'
import path              from 'path'

export default async function copyAssets() {

  const __filename        = fileURLToPath(import.meta.url)
  const __dirname         = path.dirname(__filename)
  const octiconInputPath  = path.join(__dirname, `../node_modules/@digitallinguistics/design/octicon.black.svg`)
  const octiconOutputPath = path.join(__dirname, `../assets/images/octicon.black.svg`)

  await fs.copyFile(octiconInputPath, octiconOutputPath)

}
