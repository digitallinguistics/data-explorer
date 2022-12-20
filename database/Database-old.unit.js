import Cite       from 'citation-js'
import Database   from './Database.js'
import { expect } from 'chai'
import fs         from 'fs-extra'

const { readFile } = fs

describe(`Database`, function() {

  const badUser     = `bademail@digitallinguistics.io`
  const projectID   = `c554474c-7f39-4ede-941b-c40b8f58b059`  // Nisinoon
  const referenceID = `Hieber2019b`                           // Semantic alignment in Chitimacha

  before(async function() {

    const bibtex = await readFile(`data/references.bib`, `utf8`)

    const { data: references } = new Cite(bibtex, {
      forceType:     `@bibtex/text`,
      generateGraph: false,
    })

    this.references = references
    this.reference  = references.find(ref => ref.id === referenceID)

  })

  describe(`getProjects`, function() {

    it(`returns all projects by default`, async function() {
      const db = new Database
      const { data, status } = await db.getProjects()
      expect(status).to.equal(200)
      expect(data).to.have.length(4)
    })

    it(`returns an empty array if there are no projects`, async function() {
      const db = new Database
      db.projects = []
      const { data, status } = await db.getProjects(badUser)
      expect(status).to.equal(200)
      expect(data).to.be.empty
    })

  })

  describe(`getReference`, function() {

    it(`returns a copy of the data`, async function() {
      const db = new Database
      const { data: a } = await db.getReference(referenceID)
      const { data: b } = await db.getReference(referenceID)
      expect(a).to.not.equal(b)
    })

    it(`includes the bibliography entry`, async function() {
      const db = new Database
      const { data } = await db.getReference(referenceID)
      expect(data.custom.bibEntry.html.startsWith(`<p class=bib-entry`)).to.be.true
      expect(data.custom.bibEntry.text.startsWith(`Hieber, Daniel W. 2019b. Semantic alignment`)).to.be.true
    })

    it(`200 OK`, async function() {
      const db = new Database
      const { data, status } = await db.getReference(referenceID)
      expect(status).to.equal(200)
      expect(data.title).to.equal(this.reference.title)
    })

    it(`404 Not Found`, async function() {
      const db = new Database
      const { data, status } = await db.getReference(`bad-id`)
      expect(status).to.equal(404)
      expect(data).to.be.undefined
    })

  })

  describe(`getReferences`, function() {

    const ids = [
      `Bloomfield1924`,
      `Goddard1990`,
    ]

    it(`returns copies of the data`, async function() {
      const db = new Database
      const { data: [a] } = await db.getReferences()
      const { data: [b] } = await db.getReferences()
      expect(a).to.not.equal(b)
    })

    it(`returns all references by default`, async function() {
      const db = new Database
      const { data, status } = await db.getReferences()
      expect(status).to.equal(200)
      expect(data).to.have.length(this.references.length)
    })

    it(`options: ids`, async function() {

      const db = new Database
      const { data, status } = await db.getReferences({ ids })

      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(2)

      const [a, b] = data
      expect(a.title).to.equal(`The Menomini language`)
      expect(b.title).to.equal(`Primary and secondary stem derivation in Algonquian`)

    })

    it(`option: summary`, async function() {
      const db = new Database
      const { data, status } = await db.getReferences({ ids, summary: true })
      expect(status).to.equal(200)
      expect(data.count).to.equal(2)
    })

    it(`returns an empty array if there are no references`, async function() {
      const db = new Database
      const { data, status } = await db.getReferences({ ids: [] })
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(0)
    })

  })

})
