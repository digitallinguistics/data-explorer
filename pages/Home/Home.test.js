describe(`Home`, function() {

  it(`renders`, function() {
    cy.visit(`/`)
    cy.contains(`h1`, `Oxalis`)
  })

  it(`has correct title`, function() {
    cy.visit(`/`)
    cy.title().should('eq','Oxalis | Home')
  })

})
