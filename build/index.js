import buildCSS   from './buildCSS.js'
import copyAssets from './copyAssets.js'

async function build() {
  await copyAssets()
  await buildCSS()
}

await build()
