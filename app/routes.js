import auth     from './auth.js'
import { env }  from '../config/app.js'
import handlers from '../pages/index.js'

export default function addRoutes(app) {

  app.get(`/`, handlers.Home)

  if (env === `localhost`) {
    app.get(`/.auth/login/facebook`, auth.login)
    app.get(`/.auth/logout`, auth.logout)
  }

  app.get(`/about`, handlers.About)
  app.get(`/dictionaries`, handlers.Dictionaries)
  app.get(`/languages`, handlers.Languages)
  app.get(`/projects`, handlers.Projects)

  app.use(handlers.NotFound)
  app.use(handlers.ServerError)

}
