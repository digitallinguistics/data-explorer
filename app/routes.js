import addComponentRoutes from '../components/index.js'
import auth               from './auth.js'
import { env }            from '../config/app.js'
import handlers           from '../pages/index.js'

export default function addRoutes(app) {

  app.get(`/`, handlers.Home)

  if (env === `localhost`) {
    app.get(`/.auth/login/facebook`, auth.login)
    app.get(`/.auth/logout`, auth.logout)
    app.get(`/500-test`, handlers.ServerErrorTest)
    addComponentRoutes(app)
  }

  app.get(`/about`, handlers.About)
  app.get(`/dictionaries`, handlers.Dictionaries)
  app.get(`/languages`, handlers.Languages)
  app.get(`/languages/:languageID`, handlers.Language)
  app.get(`/languages/:languageID/lexemes`, handlers.LanguageLexemes)
  app.get(`/lexemes/:lexemeID`, handlers.Lexeme)
  app.get(`/projects`, handlers.Projects)
  app.get(`/projects/:projectID`, handlers.Project)
  app.get(`/projects/:projectID/languages`, handlers.Languages)
  app.get(`/projects/:projectID/lexemes`, handlers.ProjectLexemes)

  app.use(handlers.PageNotFound)
  app.use(handlers.ServerError)

}
