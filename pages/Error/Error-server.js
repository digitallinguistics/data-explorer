export function PageNotFound(req, res) {

  if (req.method !== `GET`) {
    res.set(`Allow`, `GET`)
    return res.sendStatus(405)
  }

  res.error(`PageNotFound`)

}

export function ServerError(err, req, res, next) {

  if (process.env.NODE_ENV !== `production`) console.error(err)

  res.error(`ServerError`)

}

export function ServerErrorTest() {
  throw new Error(`Server Error Test`)
}
