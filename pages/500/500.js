/* eslint-disable
  max-params,
  no-unused-vars,
*/

export default function get(err, req, res, next) {

  const title = `500`

  res.status(500)
  res.render(`500/500`, {
    [title]: true,
    title,
  })

}
