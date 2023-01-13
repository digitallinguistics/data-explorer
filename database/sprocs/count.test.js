import DevDatabase    from '../DevDatabase.js'
import { expect }     from 'chai'
import Language       from '../../models/Language.js'
import Lexeme         from '../../models/Lexeme.js'
import { randomUUID } from 'crypto'

const db = new DevDatabase(`test`)

describe(`sproc: count`, function() {

  before(function() {
    return db.setup()
  })

  this.afterEach(function() {
    return db.clear()
  })

  after(function() {
    return db.delete()
  })

  it(`counts all documents`, async function() {

    const count      = 10
    const languageID = randomUUID()

    const lexeme = {
      language: {
        id: languageID,
      },
    }

    await db.addMany(`data`, languageID, count, lexeme)

    const { resource } = await db.data.scripts.storedProcedure(`count`).execute(languageID)

    expect(resource.count).to.equal(count)

  })

  it(`filters documents`, async function() {

    const count            = 5
    const firstLanguageID  = randomUUID()
    const secondLanguageID = randomUUID()

    await db.addMany(`data`, firstLanguageID, count, new Lexeme({ language: { id: firstLanguageID } }))
    await db.addMany(`data`, firstLanguageID, count, { type: `Text`, language: { id: firstLanguageID } })
    await db.addMany(`data`, secondLanguageID, count, new Lexeme({ language: { id: secondLanguageID } }))

    const query = `SELECT * FROM data WHERE data.type = 'Lexeme'`

    const args         = [query]
    const { resource } = await db.data.scripts.storedProcedure(`count`).execute(firstLanguageID, args)

    expect(resource.count).to.equal(count)

  })

  it(`uses a continuation token`, async function() {

    const count = 300

    await db.addMany(count)

    let total = 0

    const getCount = async continuationToken => {

      const args = [undefined, continuationToken]
      const { resource } = await db.container.scripts.storedProcedure(`count`).execute(undefined, args)

      total += resource.count

      if (resource.continuationToken) await getCount(resource.continuationToken)

    }

    await getCount()

    expect(total).to.equal(count)

  })

})
