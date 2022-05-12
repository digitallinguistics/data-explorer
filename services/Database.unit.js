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

})
