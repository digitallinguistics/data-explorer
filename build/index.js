import buildCSS   from './buildCSS.js'
import buildSVG   from './buildSVG.js'
import copyAssets from './copyAssets.js'

async function build() {
  await copyAssets()
  await buildCSS()
  await buildSVG()
}

await build()
