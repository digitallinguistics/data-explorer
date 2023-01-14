import Permissions from './Permissions.js'

export default class Lexeme {

  forms = []

  language = {}

  lemma = {
    transcription: {},
  }

  permissions = new Permissions

  projects = []

  senses = []

  type = `Lexeme`

  constructor(data = {}) {

    Object.assign(this, data)

    this.dateCreated  ??= new Date
    this.dateModified ??= new Date

  }

}
