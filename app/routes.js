import handlers from '../pages/index.js'

export default function addRoutes(app) {
  app.get(`/`, handlers.Home)
  app.get(`/about`, handlers.About)
  app.get(`/languages`, handlers.Languages)
  app.get(`/projects`, handlers.Projects)
  app.use(handlers.NotFound)
  app.use(handlers.ServerError)
}
