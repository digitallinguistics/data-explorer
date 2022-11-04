describe(`app shell`, function() {

  describe(`Main Nav`, function() {

    it(`Home`, function() {
      cy.visit(`/test`, { failOnStatusCode: false })
      cy.contains(`.navbar a`, `Home`).click()
      cy.get(`.page-title`).should(`have.text`, `Oxalis`)
    })

    it(`Projects`, function() {
      cy.visit(`/`)
      cy.contains(`.navbar a`, `Projects`).click()
      cy.url().should(`include`, `/projects`)
      cy.get(`.page-title`).should(`have.text`, `Projects`)
    })

    it(`Languages`, function() {
      cy.visit(`/`)
      cy.contains(`.navbar a`, `Languages`).click()
      cy.url().should(`include`, `/languages`)
      cy.get(`.page-title`).should(`have.text`, `Languages | All`)
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
