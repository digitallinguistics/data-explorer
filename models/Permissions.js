export default class Permissions {

  owners = []

  editors = []

  viewers = []

  public = true

  constructor(data = {}) {
    Object.assign(this, data)
  }

}
