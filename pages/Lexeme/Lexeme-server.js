import db                    from '../../config/database.js'
import getDefaultOrthography from '../../utilities/getDefaultOrthography.js'

export default async function get(req, res) {

  const title            = `Lexeme`
  const { lexemeID }     = req.params
  const { data: lexeme } = await db.getLexeme(lexemeID, res.locals.user)

  res.render(`Lexeme/Lexeme`, {
    lexeme,
    [title]: true,
    title:   lexeme ? getDefaultOrthography(lexeme.lemma) : title,
  })

}
