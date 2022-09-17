describe(`Dictionaries`, function() {

  it(`has correct title`, function() {
    cy.visit(`/dictionaries`)
    cy.title().should(`eq`, `Oxalis | Dictionaries`)
  })

})
