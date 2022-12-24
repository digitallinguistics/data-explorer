import Permissions from './Permissions.js'

export default class Lexeme {

  lemma = {}

  permissions = new Permissions

  projects = []

  type = `Lexeme`

  constructor(data = {}) {

    Object.assign(this, data)

    this.dateCreated  ??= new Date
    this.dateModified ??= new Date

  }

}
