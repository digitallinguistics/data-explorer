import Cite       from 'citation-js'
import Database   from './Database.js'
import { expect } from 'chai'
import fs         from 'fs-extra'

const { readFile } = fs

describe(`Database`, function() {

  const referenceID = `Hieber2019b` // Semantic alignment in Chitimacha

  before(async function() {

    const bibtex = await readFile(`data/references.bib`, `utf8`)

    const { data: references } = new Cite(bibtex, {
      forceType:     `@biblatex/text`,
      generateGraph: false,
    })

    this.references = references
    this.reference  = references.find(ref => ref.id === referenceID)

  })

  describe(`getReferences`, function() {

    it(`returns all references by default`, async function() {
      const db = new Database
      const { data, status } = await db.getReferences()
      expect(status).to.equal(200)
      expect(data).to.have.length(this.references.length)
    })

    it(`returns an empty array if there are no references`, async function() {
      const db = new Database
      const { data, status } = await db.getReferences({ ids: [] })
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(0)
    })

  })

})
