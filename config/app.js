export const env     = process.env.NODE_ENV ?? `localhost`
export const logging = process.env.LOGGING ?? env !== `production`
export const port    = process.env.PORT ?? 3001

