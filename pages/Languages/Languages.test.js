describe(`Languages`, function() {

  it(`displays all public languages`, function() {
    cy.visit(`/languages`)
    cy.title().should(`eq`, `Oxalis | Languages`)
    cy.get(`.page-title`).should(`have.text`, `Languages`)
    cy.get(`.languages-table caption`).should(`have.text`, `Languages`)
    cy.get(`.languages-table tbody`).children().should(`have.length`, 9)
    cy.contains(`td`, `Private`).should(`not.exist`)
  })

  it(`displays all (and only all) private languages with permissions`)

  it(`displays data for a project`)
  // /projects/{id}/languages
  // NB: If a person has permissions for a project, they'll have permissions for all the languages in the project.
  // TODO: Page Title should display the project name.

})
