describe(`Languages`, function() {

  describe(`Languages List`, function() {

    it(`when the user is not logged in, it only displays public languages`, function() {
      cy.visit(`/languages`)
      cy.get(`.languages-list`)
      .children()
      .should(`have.length`, 1)
      .first()
      .should(`have.text`, `Ojibwe`)
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
      .should(`have.length`, 4)
      .spread((a, b, c, d) => {
        expect(a).to.have.text(`Menominee`)
        expect(b).to.have.text(`Ojibwe`)
        expect(c).to.have.text(`Plains Cree`)
        expect(d).to.have.text(`Potawatomi`)
      })

    })

  })

})
