import yamlParser from 'js-yaml'

describe(`Lexeme page`, function() {

  it(`displays an error message for nonexistent / unpermitted lexemes`, function() {

    cy.visit(`/lexemes/test`)
    cy.title().should(`eq`, `Oxalis | Lexeme`)
    cy.contains(`main`, `This lexeme does not exist, or you do not have permission to view it.`)

  })

})

describe(`Lexeme Details`, function() {

  before(function() {
    cy.readFile(`data/lexemes.yml`)
    .then(yaml => yamlParser.load(yaml))
    .as(`lexemes`)
    .then(lexemes => lexemes.find(lex => lex.lemma.mod === `cuw-`))
    .as(`data`)
  })

  it(`renders data correctly`, function() {

    const { id } = this.data
    cy.visit(`/lexemes/${ id }`)

    // page title
    cy.title().should(`eq`, `Oxalis | cuw-`)

    // summary details
    cy.contains(`.page-title`, `cuw‑`) // NOTE: This uses a non-breaking hyphen.
    cy.contains(`header`, `go`)
    cy.contains(`header`, `walk`)

    // Form tab
    cy.hash().should(`eq`, `#form`)
    cy.get(`#form`).should(`be.visible`)

    // Lemma
    cy.contains(`.txn`, `cuw‑`)
    cy.contains(`.txn`, `čuw‑`)
    cy.contains(`.txn`, `t͡ʃuw‑`)

  })

})
