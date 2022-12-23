export default class Lexeme {

  lemma = {}

  projects = []

  type = `Lexeme`

  constructor(data = {}) {
    Object.assign(this, data)
  }

}
