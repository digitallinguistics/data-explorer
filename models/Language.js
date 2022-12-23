export default class Language {

  name = {}

  projects = []

  type = `Language`

  constructor(data = {}) {
    Object.assign(this, data)
  }

}
