describe(`Page Not Found`, function() {

  it(`has correct title`, function() {
    cy.visit(`/unknown`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Page Not Found`)
  })

  it(`renders a 404 page for unknown URLs`, function() {
    cy.visit(`/unknown`, { failOnStatusCode: false })
    cy.contains(`h1`, `404: Page Not Found`)
  })

  it(`returns a 405 response for unknown methods`, function() {
    cy.request({
      failOnStatusCode: false,
      method:           `POST`,
      url:              `/`,
    }).then(response => {
      expect(response.status).to.equal(405)
    })
  })

})
