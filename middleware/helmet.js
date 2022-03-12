import helmet          from 'helmet'
import { randomBytes } from 'crypto'

const config = {
  referrerPolicy: {
    policy: `same-origin`,
  },
}

function generateNonce(req, res) {
  res.locals.nonce = randomBytes(16).toString(`base64`)
  return `'nonce-${ res.locals.nonce }'`
}

config.contentSecurityPolicy = {
  directives:   {
    defaultSrc:              [`'self'`, `*.digitallinguistics.io`],
    scriptSrc:               [`'self'`, `*.digitallinguistics.io`, generateNonce],
    upgradeInsecureRequests: [],
  },
}

export default helmet(config)
