export default function logger(req, res, next) {

  if (process.env.LOGGING) {
    console.info(`${ new Date().toString() }: ${ req.originalUrl }`)
  }

  next()

}
