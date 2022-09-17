/* eslint-disable
  max-params,
  no-unused-vars,
*/

import { env } from '../../config/app.js'

export default function get(err, req, res, next) {

  if (env !== `production`) console.error(err)

  res.status(500)
  res.render(`500/500`, {
    500:   true,
    title: `Error`,
  })

}
