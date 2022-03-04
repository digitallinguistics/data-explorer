describe(`main layout`, function() {

  describe(`Navbar`, function() {

    it(`Home`, function() {
      cy.visit(`/languages`)
      cy.contains(`.navbar a`, `Home`)
      .click()
      cy.contains(`h1`, `Home`)
    })

    it(`Languages`, function() {
      cy.visit(`/`)
      cy.contains(`.navbar a`, `Languages`)
      .click()
      cy.url().should(`include`, `/languages`)
      cy.contains(`h1`, `Languages`)
    })

  })

})
