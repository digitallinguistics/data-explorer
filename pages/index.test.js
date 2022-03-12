describe(`layout`, function() {

  describe(`Main Nav`, function() {

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

  describe(`Login / Logout`, function() {

    it(`logs in / logs out`, function() {

      // Shows a "Log in" link when logged out
      cy.visit(`/`)
      cy.contains(`a`, `Log in`)

      // Logs in
      .click()

      // Shows a "Log out" link when logged in
      cy.contains(`a`, `Log out`)

      // Logs out
      .click()
      cy.contains(`a`, `Log in`)

    })

  })

})
