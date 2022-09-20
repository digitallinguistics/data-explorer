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
    cy.contains(`Date Created`).next().should(`have.text`, new Date(`2022-07-17T00:00:00.000Z`).toLocaleDateString(`en-CA`))
    cy.contains(`Date Modified`).next().should(`have.text`, new Date(`2022-07-18T00:00:00.000Z`).toLocaleDateString(`en-CA`))
    cy.get(`tbody`).children().should(`have.length`, 2)
  })

})
