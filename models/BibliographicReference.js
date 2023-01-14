export default class BibliographicReference {

  type = `BibliographicReference`

  constructor(data = {}) {

    Object.assign(this, data)

    this.dateCreated  ??= new Date
    this.dateModified ??= new Date

  }

}
