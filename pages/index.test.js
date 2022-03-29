describe(`layout`, function() {

  describe(`Main Nav`, function() {

    it(`About`, function() {
      cy.visit(`/`)
      cy.contains(`.navbar a`, `About`)
      .click()
      cy.url().should(`include`, `/about`)
      cy.contains(`h1`, `About`)
    })

    it(`Dictionaries`, function() {
      cy.visit(`/`)
      cy.contains(`.navbar a`, `Dictionaries`)
      .click()
      cy.url().should(`include`, `/dictionaries`)
      cy.contains(`h1`, `Dictionaries`)
    })

    it(`Home`, function() {
      cy.visit(`/languages`)
      cy.contains(`.navbar a`, `Home`)
      .click()
      cy.contains(`h1`, `Oxalis`)
    })

    it(`Languages`, function() {
      cy.visit(`/`)
      cy.contains(`.navbar a`, `Languages`)
      .click()
      cy.url().should(`include`, `/languages`)
      cy.contains(`h1`, `Languages`)
    })

    it(`Projects`, function() {
      cy.visit(`/`)
      cy.contains(`.navbar a`, `Projects`)
      .click()
      cy.url().should(`include`, `/projects`)
      cy.contains(`h1`, `Projects`)
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
