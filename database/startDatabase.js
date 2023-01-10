import { exec }          from '@actions/exec'
import { fileURLToPath } from 'url'
import path              from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

await exec(`powershell`, [`-NoProfile`, `-ExecutionPolicy`, `Unrestricted`, `-Command`, `-f`, path.resolve(__dirname, `./start.ps1`)])
