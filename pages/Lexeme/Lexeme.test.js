import yamlParser from 'js-yaml'

describe(`Lexeme page`, function() {

  before(function() {
    cy.readFile(`data/lexemes.yml`)
    .then(yaml => yamlParser.load(yaml))
    .as(`lexemes`)
    .then(lexemes => lexemes.find(lex => lex.id === `abc56564-5754-4698-845c-2ea32a760bbd`))
    .as(`data`)
  })

  // Note: The `<title>` content should be different for each of these too.
  it(`displays an error for nonexistent lexemes`)
  it(`displays an error when the user is not logged in and trys to access a private lexeme`)
  it(`displays an error when the user does not have permission to access a private lexeme`)

  it(`displays the lexeme data correctly`, function() {

    const { data } = this

    cy.visit(`/lexemes/${ data.id }`)

    // page title
    cy.title().should(`eq`, `Oxalis | ${ data.lemma.mod }`)

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
