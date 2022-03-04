describe(`Home`, function() {

  it(`renders`, function() {
    cy.visit(`/`)
    cy.contains(`h1`, `Home`)
  })

})
