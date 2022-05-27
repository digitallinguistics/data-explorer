describe(`Projects`, function() {

  it(`has correct title`, function() {
    cy.visit(`/projects`)
    cy.title().should(`eq`, `Oxalis | Projects`)
  })
})
