import { env } from '../../config/app.js'

export function PageNotFound(req, res) {

  if (req.method !== `GET`) {
    res.set(`Allow`, `GET`)
    return res.sendStatus(405)
  }

  res.error(`PageNotFound`)

}

export function ServerError(err, req, res, next) {

  if (env !== `production`) console.error(err)

  res.error(`ServerError`)

}

export function ServerErrorTest() {
  throw new Error(`Server Error Test`)
}
