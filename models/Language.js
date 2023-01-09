import Permissions from './Permissions.js'

export default class Language {

  name = {}

  notes = []

  permissions = new Permissions

  projects = []

  type = `Language`

  constructor(data = {}) {

    Object.assign(this, data)

    this.dateCreated  ??= new Date
    this.dateModified ??= new Date

  }

}
