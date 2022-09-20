describe(`Languages`, function() {

  it(`when the user is not logged in, it only displays public languages`, function() {
    cy.visit(`/languages`)
    cy.title().should(`eq`, `Oxalis | Languages`)
    // TODO: Check the rest of the displayed data.
  })

  it(`when the user is logged in, it displays languages that are public or that they own, edit, or view`)
  it(`clicking a language loads the Language page`)

})
