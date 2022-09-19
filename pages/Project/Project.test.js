describe(`Project Page`, function() {

  const publicProjectID = `6a0fcc10-859c-4af1-8105-156ccfd95310`

  it(`displays the project details`, function() {
    cy.visit(`/projects/${ publicProjectID }`)
    cy.get(`#project-url`)
    .should(`have.value`, `https://data.digitallinguistics.io/projects/${ publicProjectID }`)
    cy.contains(`# of languages`).next().should(`have.text`, `2`)
    cy.contains(`# of lexemes`).next().should(`have.text`, `2`)
    cy.contains(`# of collaborators`).next().should(`have.text`, `1`)
    cy.get(`.readme`).should(`include.text`, `Public Test Project`)
    cy.get(`.access`).should(`include.text`, `Anyone can view the items in this project.`)
    cy.contains(`Date Created`).next().should(`have.text`, `2022-07-16`)
    cy.contains(`Date Modified`).next().should(`have.text`, `2022-07-17`)
    cy.get(`tbody`).children().should(`have.length`, 2)
  })

})
