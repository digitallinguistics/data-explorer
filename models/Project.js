import Permissions from './Permissions.js'

export default class Language {

  permissions = new Permissions

  type = `Project`

  constructor(data = {}) {

    Object.assign(this, data)

    this.dateCreated  ??= new Date
    this.dateModified ??= new Date

  }

}
