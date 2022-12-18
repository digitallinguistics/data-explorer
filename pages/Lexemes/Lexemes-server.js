import compareLemmas      from '../../utilities/compareLemmas.js'
import db                 from '../../config/database.js'
import getDefaultLanguage from '../../utilities/getDefaultLanguage.js'
import { hasAccess }      from '../../utilities/permissions.js'

export default async function get(req, res) {

  const { languageID, projectID } = req.params
  let language
  let project

  // NB: Project should be validated before language,
  // because it occurs first in the URL.
  if (projectID) {

    ({ data: project } = await db.getProject(projectID))

    if (!project) {
      return res.error(`ItemNotFound`, {
        message: `No project exists with ID <code class=code>${ projectID }</code>.`,
      })
    }

    if (!project.permissions.public && !res.locals.user) {
      return res.error(`Unauthenticated`, {
        message: `You must be logged in to view this project.`,
      })
    }

    if (!hasAccess(res.locals.user, project)) {
      return res.error(`Unauthorized`, {
        message: `You do not have permission to view this project.`,
      })
    }

  }

  if (languageID) {

    ({ data: language } = await db.getLanguage(languageID))

    if (!language) {
      return res.error(`ItemNotFound`, {
        message: `No language exists with ID <code class=code>${ languageID }</code>.`,
      })
    }

    if (!language.permissions.public && !res.locals.user) {
      return res.error(`Unauthenticated`, {
        message: `You must be logged in to view this language.`,
      })
    }

    if (!hasAccess(res.locals.user, language)) {
      return res.error(`Unauthorized`, {
        message: `You do not have permission to view this language.`,
      })
    }

  }

  let lexemes     = []
  let summaryName = ``

  if (languageID && !projectID) {

    summaryName = getDefaultLanguage(language.name, language.defaultAnalysisLanguage);

    ({ data: lexemes } = await db.getLexemes({
      language: languageID,
    }))

  } else if (projectID && !languageID) {

    summaryName = project.name;

    ({ data: lexemes } = await db.getLexemes({
      project: projectID,
    }))

  } else {

    summaryName = `${ project.name } | ${ getDefaultLanguage(language.name, language.defaultAnalysisLanguage) }`;

    ({ data: lexemes } = await db.getLexemes({
      project: projectID,
    }))

    lexemes = lexemes.filter(lex => lex.language.id === languageID)

  }

  lexemes.sort(compareLemmas)

  res.render(`Lexemes/Lexemes`, {
    language,
    lexemes,
    Lexemes: true,
    project,
    title:   `${ summaryName } | Lexemes`,
  })

}
