describe(`404`, function() {

  it(`renders a 404 page for unknown URLs`, function() {
    cy.visit(`/unknown`, { failOnStatusCode: false })
    cy.contains(`h1`, `404: Not Found`)
  })

  it(`renders a 404 page for unknown methods`, function() {
    cy.request({
      failOnStatusCode: false,
      method:           `POST`,
      url:              `/`,
    }).then(response => {
      expect(response.status).to.equal(404)
    })
  })

  it(`has correct title`, function() {
    cy.visit(`/unknown`, { failOnStatusCode: false })
    cy.title().should('eq','Oxalis | 404')
  })

})
