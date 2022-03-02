describe(`Languages`, function() {
  it(`renders`, function() {
    cy.visit(`/languages`)
    cy.contains(`h1`, `Languages`)
  })
})
