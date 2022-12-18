import auth     from './auth.js'
import { env }  from '../config/app.js'
import handlers from '../pages/index.js'

export default function addRoutes(app) {

  app.get(`/`, handlers.Home)

  if (env === `localhost`) {
    app.get(`/.auth/login/facebook`, auth.login)
    app.get(`/.auth/logout`, auth.logout)
    app.get(`/500-test`, handlers.ServerErrorTest)
  }

  app.get(`/about`, handlers.About)
  app.get(`/dictionaries`, handlers.Dictionaries)
  app.get(`/languages`, handlers.Languages)
  app.get(`/languages/:languageID`, handlers.Language)
  app.get(`/languages/:languageID/lexemes`, handlers.Lexemes)
  app.get(`/languages/:languageID/lexemes/:lexemeID`, handlers.Lexeme)
  app.get(`/languages/:languageID/projects`, handlers.Projects)
  app.get(`/projects`, handlers.Projects)
  app.get(`/projects/:projectID`, handlers.Project)
  app.get(`/projects/:projectID/languages`, handlers.Languages)
  app.get(`/projects/:projectID/lexemes`, handlers.Lexemes)

  app.use(handlers.PageNotFound)
  app.use(handlers.ServerError)

}
