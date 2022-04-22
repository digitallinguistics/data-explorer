import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const oneWeek = 604800

const options = {
  maxAge: oneWeek,
}

export default function staticMiddleware(express) {
  return express.static(path.join(__dirname, `../public`), options)
}
