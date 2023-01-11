import yamlParser from 'js-yaml'

import Permissions from '../../models/Permissions.js'
import Project     from '../../models/Project.js'

const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

describe(`Projects`, function() {

  before(function() {
    cy.task(`setupDatabase`)
  })

  afterEach(function() {
    cy.clearDatabase()
  })

  it(`200: OK (public projects)`, function() {

    const projects = [
      { name: `Chitimacha Dictionary` },
      { name: `Nisinoon` },
      { name: `Typology Project` },
    ]

    for (const project of projects) {
      cy.upsertOne(new Project(project))
    }

    cy.visit(`/projects`)
    cy.title().should(`eq`, `Oxalis | Projects`)
    cy.get(`.page-title`).should(`have.text`, `Projects`)
    cy.get(`.page-nav`).should(`not.exist`)
    cy.get(`.projects-list`).children().should(`have.length`, projects.length)

    for (const project of projects) {
      cy.contains(`header`, project.name)
    }

  })

  it(`200: OK (private projects)`, function() {

    // SETUP

    const publicProject = new Project

    const userProject = new Project({
      permissions: new Permissions({
        owners: [msAuthUser],
        public: false,
      }),
    })

    const privateProject = new Project({
      permissions: new Permissions({
        public: false,
      }),
    })

    cy.upsertOne(publicProject)
    cy.upsertOne(userProject)
    cy.upsertOne(privateProject)

    cy.visit(`/projects`)
    cy.get(`.projects-list`).children().should(`have.length`, 1)
    cy.setCookie(msAuthCookie, msAuthUser)
    cy.reload()
    cy.get(`.projects-list`).children().should(`have.length`, 2)

  })

  it(`project details`, function() {

    cy.readFile(`data/project.yml`)
    .then(yaml => yamlParser.load(yaml))
    .then(project => {

      cy.upsertOne(project)
      cy.visit(`/projects`)

      cy.get(`[data-id=${ project.id }]`).within(() => {
        cy.contains(`.project__header`, project.name)
        cy.contains(`.date-created`, `Created ${ new Date(project.dateCreated).toLocaleDateString(undefined, { dateStyle: `long` }) }`)
      })

    })

  })

})
