import copy from '../utilities/copy.js'

export default class Lexeme {

  constructor(data) {
    Object.assign(this, copy(data))
  }

  /**
   * Retrieves a unique list of IDs of all bibliographic references at the lexeme, sense, and form levels.
   * @returns {Set<UUID>}
   */
  get references() {

    const lexemeReferences = this.bibliography?.map(ref => ref.id) ?? []

    const senseReferences = this.senses.reduce((arr, sense) => {
      if (!sense.bibliography) return arr
      const ids = sense.bibliography.map(ref => ref.id)
      arr.push(...ids)
      return arr
    }, [])

    const formReferences = this.forms.reduce((arr, form) => {
      if (!form.bibliography) return arr
      const ids = form.bibliography.map(ref => ref.id)
      arr.push(...ids)
      return arr
    }, [])

    return new Set([
      ...lexemeReferences,
      ...senseReferences,
      ...formReferences,
    ])

  }

}
