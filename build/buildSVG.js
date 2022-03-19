import createSpriteCollection from 'svgstore'
import { fileURLToPath }      from 'url'
import path                   from 'path'
import recurse                from 'readdirp'

import { readFile, writeFile } from 'fs/promises'

const recurseOptions = {
  fileFilter: [`*.svg`, `!favicon.svg`],
}

const spriteOptions = {
  copyAttrs: [
    `fill`,
    `stroke`,
    `stroke-width`,
    `stroke-linecap`,
    `stroke-linejoin`,
  ],
  svgAttrs: {
    'aria-hidden': true,
    style:         `display: none;`,
  },
}

export default async function buildSVG() {

  const __filename     = fileURLToPath(import.meta.url)
  const __dirname      = path.dirname(__filename)
  const imagesPath     = path.join(__dirname, `../public/images`)
  const sprites        = createSpriteCollection(spriteOptions)
  const svgFilesStream = await recurse(imagesPath, recurseOptions)

  for await (const entry of svgFilesStream) {

    const ext      = path.extname(entry.basename)
    const filename = path.basename(entry.basename, ext)
    const filePath = path.join(imagesPath, entry.path)
    const svg      = await readFile(filePath, `utf8`)

    sprites.add(filename, svg)

  }

  const html        = sprites.toString({ inline: true })
  const spritesPath = path.join(__dirname, `../layout/sprites.hbs`)

  await writeFile(spritesPath, html, `utf8`)

}
