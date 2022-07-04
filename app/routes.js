import auth     from './auth.js'
import { env }  from '../config/app.js'
import handlers from '../pages/index.js'

export default function addRoutes(app) {

  app.get(`/`, handlers.Home)

  if (env === `localhost`) {
    app.get(`/.auth/login/facebook`, auth.login)
    app.get(`/.auth/logout`, auth.logout)
    app.get(`/500-test`, handlers.ServerErrorTest)
    app.get(`/design`, handlers.Design)
    app.get(`/design/:component`, handlers.Design)
  }

  app.get(`/about`, handlers.About)
  app.get(`/dictionaries`, handlers.Dictionaries)
  app.get(`/languages`, handlers.Languages)
  app.get(`/languages/:languageID`, handlers.Languages)
  app.get(`/languages/:languageID/lexemes`, handlers.LanguageLexemes)
  app.get(`/lexemes/:lexemeID`, handlers.Lexeme)
  app.get(`/projects`, handlers.Projects)
  app.get(`/projects/:projectID/lexemes`, handlers.ProjectLexemes)

  app.use(handlers.NotFound)
  app.use(handlers.ServerError)

}
