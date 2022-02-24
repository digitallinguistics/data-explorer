import handlers from '../pages/index.js'

export default function addRoutes(app) {
  app.get(`/`, handlers.Home)
  app.get(`/languages`, handlers.Languages)
  app.use(handlers.notFound)
  app.use(handlers.serverError)
}
