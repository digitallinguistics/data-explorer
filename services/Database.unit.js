import Database   from './Database.js'
import { expect } from 'chai'

describe(`Database`, function() {

  it(`initialize`, async function() {
    const db = new Database
    await db.initialize()
  })

  it(`getLanguages`, async function() {
    const db = new Database
    await db.initialize()
    const result = await db.getLanguages()
    expect(result).to.have.length(2)
  })

  it(`getLanguages`, async function() {
    const db = new Database
    await db.initialize()
    const result = await db.getLanguages(`test@digitallinguistics.io`)
    expect(result).to.have.length(6)
  })

  it(`getLexemes`, async function() {
    const db = new Database
    await db.initialize()
    const results = await db.getLexemes(`6a0fcc10-859c-4af1-8105-156ccfd95310`)
    expect(results.length).to.be.greaterThan(0)
  })

})
