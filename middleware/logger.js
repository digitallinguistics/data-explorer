import { logging } from '../config/app.js'

export default function logger(req, res, next) {

  if (logging) {
    console.info(`${ new Date().toString() }: ${ req.originalUrl }`)
  }

  next()

}
