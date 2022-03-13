/**
 * Copies any assets from dependencies (especially @digitallinguistics/design) into the project.
 */

import { copy }          from 'fs-extra'
import { fileURLToPath } from 'url'
import path              from 'path'

export default async function copyAssets() {

  const __filename = fileURLToPath(import.meta.url)
  const __dirname  = path.dirname(__filename)
  const assetsDir  = path.join(__dirname, `../assets`)
  const designDir  = path.join(__dirname, `../node_modules/@digitallinguistics/design`)

  await copy(path.join(designDir, `images/octicon.black.svg`), path.join(assetsDir, `images/octicon.svg`))

  const firaPath = `fonts/Fira`
  await copy(path.join(designDir, firaPath), path.join(assetsDir, firaPath))

  const libertinusPath = `fonts/Libertinus`
  await copy(path.join(designDir, libertinusPath), path.join(assetsDir, libertinusPath))

}
