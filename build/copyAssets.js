/**
 * Copies any assets from dependencies (especially @digitallinguistics/design) into the project.
 * Also copies assets from `assets/` to `public/`.
 */

import { fileURLToPath } from 'url'
import path              from 'path'

import { copy, emptyDir } from 'fs-extra'

export default async function copyAssets() {

  const __filename = fileURLToPath(import.meta.url)
  const __dirname  = path.dirname(__filename)
  const assetsDir  = path.join(__dirname, `../assets`)
  const designDir  = path.join(__dirname, `../node_modules/@digitallinguistics/design/assets`)
  const publicDir  = path.join(__dirname, `../public`)

  await emptyDir(publicDir)

  // Copy images from design system

  const octiconPath = `images/octicon.svg`
  await copy(path.join(designDir, octiconPath), path.join(assetsDir, octiconPath))

  const oxalisPath = `images/oxalis.svg`
  await copy(path.join(designDir, oxalisPath), path.join(assetsDir, oxalisPath))

  // Copy fonts from design system

  const firaPath = `fonts/Fira`
  await copy(path.join(designDir, firaPath), path.join(publicDir, firaPath))

  const libertinusPath = `fonts/Libertinus`
  await copy(path.join(designDir, libertinusPath), path.join(publicDir, libertinusPath))

  // Copy project-specific assets

  function filter(fullPath) {
    if (fullPath.includes(`favicon`)) return true
    if (fullPath.endsWith(`.svg`)) return false
    return true
  }

  await copy(assetsDir, publicDir, { filter })

}
