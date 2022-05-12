describe(`Languages`, function() {

  it(`has correct title`, function() {
    cy.visit(`/languages`)
    cy.title().should(`eq`, `Oxalis | Languages`)
  })

  describe(`Languages List`, function() {

    it(`when the user is not logged in, it only displays public languages`, function() {
      cy.visit(`/languages`)
      cy.get(`.languages-list`)
      .children()
      .should(`have.length`, 2)
      .then(([first, second]) => {
        expect(first).to.contain(`Chitimacha`)
        expect(second).to.contain(`Ojibwe`)
      })
    })

    it(`when the user is logged in, it displays languages that are public or that they own, edit, or view`, function() {

      const { msAuthCookie, msAuthHeader, testUser } = Cypress.env()

      cy.visit(`/languages`, {
        headers: {
          Cookie:         `${ msAuthCookie }=12345`,
          [msAuthHeader]: testUser,
        },
      })

      cy.get(`.languages-list`)
      .children()
      .should(`have.length`, 6)
      .spread((a, b, c, d, e, f) => {
        expect(a).to.have.text(`Chitimacha`)
        expect(b).to.have.text(`Menominee`)
        expect(c).to.have.text(`Meskwaki`)
        expect(d).to.have.text(`Ojibwe`)
        expect(e).to.have.text(`Plains Cree`)
        expect(f).to.have.text(`Potawatomi`)
      })

    })

    it(`clicking a language loads the Language page`, function() {

      const ojibweID = `bc93d0ad-5afb-462b-b68c-13913124fd3e`

      cy.visit(`/languages`)
      cy.contains(`li`, `Ojibwe`)
      .click()

      cy.url()
      .should(`eq`, `http://localhost:3001/languages/${ ojibweID }`)

    })

  })

})
