export default class Language {

  name = {}

  permissions = {
    owners:  [],
    editors: [],
    viewers: [],
    public:  true,
  }

  projects = []

  type = `Language`

  constructor(data = {}) {
    Object.assign(this, data)
  }

}
