import copyAssets from './copyAssets.js'

async function build() {
  await copyAssets()
}

await build()
