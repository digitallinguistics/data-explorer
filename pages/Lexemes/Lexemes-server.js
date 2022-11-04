import compareLemmas      from '../../utilities/compareLemmas.js'
import db                 from '../../config/database.js'
import getDefaultLanguage from '../../utilities/getDefaultLanguage.js'
import hasAccess          from '../../utilities/hasAccess.js'

export default async function get(req, res) {

  const { languageID, projectID } = req.params
  const collectionType            = languageID ? `language` : `project`
  const collectionID              = languageID ?? projectID
  const collectionMethod          = collectionType === `language` ? `getLanguage` : `getProject`
  const { data: collection }      = await db[collectionMethod](collectionID)

  if (!collection) {
    return res.error(`ItemNotFound`, {
      message: `No ${ collectionType } exists with ID <code class=code>${ collectionID }</code>.`,
    })
  }

  if (!collection.permissions.public && !res.locals.user) {
    return res.error(`Unauthenticated`, {
      message: `You must be logged in to view this ${ collectionType }.`,
    })
  }

  if (!hasAccess(res.locals.user, collection)) {
    return res.error(`Unauthorized`, {
      message: `You do not have permission to view this ${ collectionType }.`,
    })
  }

  const { data: lexemes } = await db.getLexemes({
    [collectionType]: collectionID,
  })

  lexemes.sort(compareLemmas)

  const summaryName = collectionType === `language` ?
    getDefaultLanguage(collection.name, collection.defaultAnalysisLanguage) :
    collection.name

  res.render(`Lexemes/Lexemes`, {
    lexemes,
    Lexemes:     true,
    summaryName,
    title:       `${ summaryName } | Lexemes`,
  })

}
