describe(`Projects`, function() {

  it(`displays data correctly`, function() {
    cy.visit(`/projects`)
    cy.title().should(`eq`, `Oxalis | Projects`)
    cy.get(`.projects-list`).children().should(`have.length`, 3)
  })

})
