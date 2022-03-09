import { expect }        from 'chai'
import { fileURLToPath } from 'url'
import { readFile }      from 'fs/promises'

import {
  dirname as getDirname,
  join as joinPath,
} from 'path'

const __filename  = fileURLToPath(import.meta.url)
const __dirname   = getDirname(__filename)
const currentYear = new Date().getFullYear()

describe(`docs`, function() {

  it(`license has the correct year`, async function() {

    const licensePath = joinPath(__dirname, `../LICENSE.md`)
    const licenseText = await readFile(licensePath, `utf8`)
    const yearText    = `2019–${ currentYear }`

    expect(licenseText).to.include(yearText)

  })

  it(`readme has the correct year`, async function() {

    const readmePath = joinPath(__dirname, `../README.md`)
    const readmeText = await readFile(readmePath, `utf8`)
    const yearText   = `Hieber, Daniel W. ${ currentYear }.`

    expect(readmeText).to.include(yearText)

  })

})
