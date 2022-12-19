describe(`Error Page`, function() {

  it(`404: Page Not Found`, function() {
    cy.visit(`/unknown`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Page Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Page Not Found`)
    cy.get(`.error-message`).should(`have.text`, `This page does not exist.`)
  })

  it(`405: Method Not Allowed`, function() {
    cy.request({
      failOnStatusCode: false,
      method:           `POST`,
      url:              `/`,
    }).then(response => {
      expect(response.status).to.equal(405)
    })
  })

  if (process.env.NODE_ENV !== `production`) {

    it(`500: Server Error`, function() {
      cy.visit(`/500-test`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Server Error`)
      cy.get(`.page-title`).should(`have.text`, `500: Server Error`)
      cy.get(`.error-message`).should(`have.text`, `Please consider opening an issue on GitHub to report this error.`)
    })

  }

})
