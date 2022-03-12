import { fileURLToPath } from 'url'
import path              from 'path'
import { readFile }      from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

function createBugReportQuery() {

  const params = {
    labels:   `🐞 bug`,
    template: `bug_report.md`,
  }

  return new URLSearchParams(params).toString()

}

function getCriticalCSS() {
  const layoutCSSPath = path.join(__dirname, `../layout/layout.css`)
  return readFile(layoutCSSPath, `utf8`)
}

function createFeatureRequestQuery() {

  const params = {
    labels:   `🎁 feature`,
    template: `feature_request.md`,
  }

  return new URLSearchParams(params).toString()

}

async function getMetadata() {
  const metaPath = path.join(__dirname, `../package.json`)
  const json     = await readFile(metaPath, `utf8`)
  return JSON.parse(json)
}

export default async function addLocals(locals) {
  Object.assign(locals, {
    bugReportQuery:      createBugReportQuery(),
    criticalCSS:         await getCriticalCSS(),
    featureRequestQuery: createFeatureRequestQuery(),
    meta:                await getMetadata(),
  })
}
