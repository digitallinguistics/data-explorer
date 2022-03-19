import buildCSS   from './buildCSS.js'
import buildSVG   from './buildSVG.js'
import copyAssets from './copyAssets.js'

import { oraPromise as createSpinner } from 'ora'

void async function build() {
  await createSpinner(copyAssets(), `Copy assets into project.`)
  await createSpinner(buildCSS(), `Build CSS.`)
  await createSpinner(buildSVG(), `Build SVG.`)
}()
