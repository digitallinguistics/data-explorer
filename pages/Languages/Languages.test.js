describe(`Languages`, function() {
  it(`renders`, function() {
    cy.visit(`/languages`)
    cy.contains(`h1`, `Languages`)
  })

  it(`has correct title`, function() {
    cy.visit(`/languages`)
    cy.title().should('eq','Oxalis | Languages')
  })
})
