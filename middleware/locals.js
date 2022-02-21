import { fileURLToPath } from 'url'
import path              from 'path'
import { readFile }      from 'fs/promises'

function createBugReportQuery() {

  const params = {
    body:   `Please describe the steps to reproduce the problem, the behavior you expected, and the actual behavior of the app. Please provide any other context that might be useful as well.`,
    labels: `🐞 bug`,
  }

  return new URLSearchParams(params).toString()

}

function createFeatureRequestQuery() {

  const params = {
    body:   `If your feature is related to a problem, please describe the problem here. Otherwise, please describe what you would like to be able to do, as well as the solution you'd prefer, and any alternatives you've considered, and any additional context that would be helpful.`,
    labels: `🎁 feature`,
  }

  return new URLSearchParams(params).toString()

}

async function getMetadata() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const metaPath = path.join(__dirname, `../package.json`)
  const json = await readFile(metaPath, `utf8`)
  return JSON.parse(json)
}

export default async function getLocals(locals) {
  Object.assign(locals, {
    bugReportQuery:      createBugReportQuery(),
    featureRequestQuery: createFeatureRequestQuery(),
    meta:                await getMetadata(),
  })
}
