import yamlParser from 'js-yaml'

describe(`Lexeme page`, function() {

  const lexemeID = `79eb0aaf-944c-40b4-93f3-e1785ec0adde` // Plains Cree 'axe'

  before(function() {
    cy.readFile(`data/lexemes.yml`)
    .then(yaml => yamlParser.load(yaml))
    .as(`lexemes`)
    .then(lexemes => lexemes.find(lex => lex.id === lexemeID))
    .as(`data`)
  })

  it(`displays the lexeme data correctly`, function() {

    const { data } = this

    cy.visit(`/lexemes/${ data.id }`)

    // page title
    cy.title().should(`eq`, `Oxalis | ${ data.lemma.SRO }`)

    // summary details
    cy.contains(`.page-title`, data.lemma.SRO) // NOTE: This uses a non-breaking hyphen.
    cy.contains(`header`, data.senses[0].gloss)

    // Form tab
    cy.hash().should(`eq`, `#form`)
    cy.get(`#form`).should(`be.visible`)

    // Lemma
    cy.contains(`.mot`, data.lemma.SRO)
    cy.contains(`.mot`, data.lemma.syl)

  })

})
