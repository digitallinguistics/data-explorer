import helmet from 'helmet'

const config = {
  referrerPolicy: {
    policy: `same-origin`,
  },
}

config.contentSecurityPolicy = {
  directives:   {
    defaultSrc:              [`'self'`, `*.digitallinguistics.io`],
    upgradeInsecureRequests: [],
  },
}

export default helmet(config)
