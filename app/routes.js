import handlers from '../pages/index.js'

export default function addRoutes(app) {
  app.get(`/`, handlers.Home)
  app.get(`/languages`, handlers.Languages)
}
