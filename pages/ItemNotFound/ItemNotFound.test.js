describe(`Item Not Found Page`, function() {

  it(`displays a 404 page`, function() {
    cy.visit(`/languages/bad-id`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Item Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
    cy.get(`.error-message`).should(`have.text`, `The requested ID does not exist.`)
  })

})
