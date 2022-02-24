import handlers from '../pages/index.js'

export default function addRoutes(app) {
  app.get(`/`, handlers.Home)
  app.get(`/languages`, handlers.Languages)

  app.use((req, res) => {
    handlers.error404(req, res)
  })

  app.use((err, req, res, next) => {
    console.error(err.message)
    handlers.ServerError(req, res)
  })
}
