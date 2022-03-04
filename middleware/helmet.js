import { env } from '../config/app.js'
import helmet  from 'helmet'

const config = {
  referrerPolicy: {
    policy: `same-origin`,
  },
}

if (env === `production`) {
  config.contentSecurityPolicy = {
    directives:   {
      defaultSrc:              [`'self'`, `*.digitallinguistics.io`],
      upgradeInsecureRequests: true,
    },
  }
}

export default helmet(config)
