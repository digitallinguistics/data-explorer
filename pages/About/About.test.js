describe(`About`, function() {

  it(`has correct title`, function() {
    cy.visit(`/about`)
    cy.title().should(`eq`, `Oxalis | About`)
  })

})
