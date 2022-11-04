import yamlParser from 'js-yaml'

describe(`Project Page`, function() {

  const publicProjectID = `c554474c-7f39-4ede-941b-c40b8f58b059` // Nisinoon

  before(function() {
    cy.readFile(`data/projects.yml`)
    .then(yaml => yamlParser.load(yaml))
    .as(`projects`)
    .then(projects => projects.find(proj => proj.id === publicProjectID))
    .as(`data`)
  })

  it(`displays the project details`, function() {
    const { data } = this
    cy.visit(`/projects/${ publicProjectID }`)
    cy.contains(`# of languages`).next().should(`have.text`, `4`)
    cy.contains(`# of lexemes`).next().should(`have.text`, `12`)
    cy.contains(`# of collaborators`).next().should(`have.text`, `2`)
    cy.get(`.readme`).should(`include.text`, data.readme.markdown)
    cy.get(`.access`).should(`include.text`, data.access.note.text)
    cy.get(`#url`).should(`have.value`, data.link)
    cy.contains(`Date Created`).next().should(`have.text`, new Date(data.dateCreated).toLocaleDateString(`en-CA`))
    cy.contains(`Date Modified`).next().should(`have.text`, new Date(data.dateModified).toLocaleDateString(`en-CA`))
    cy.get(`tbody`).children().should(`have.length`, 4)
  })

})
