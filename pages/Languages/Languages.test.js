import { msAuthCookie } from '../../constants/index.js'

describe(`Languages`, function() {

  it(`displays all public languages`, function() {
    cy.visit(`/languages`)
    cy.title().should(`eq`, `Oxalis | Languages`)
    cy.get(`.page-title`).should(`have.text`, `Languages`)
    cy.get(`.languages-table caption`).should(`have.text`, `Languages`)
    cy.get(`.languages-table tbody`).children().should(`have.length`, 9)
    cy.contains(`td`, `Private`).should(`not.exist`)
  })

  it(`displays all (and only all) private languages with permissions`, function() {
    cy.visit(`/languages`)
    cy.setCookie(msAuthCookie, `test@digitallinguistics.io`)
    cy.visit(`/languages`)
    cy.contains(`td`, `Private Test Language`)
  })

  // NB: If a person has permissions for a project, they'll have permissions for all the languages in the project.
  it.only(`displays data for a project`, function() {
    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `test@digitallinguistics.io`)
    const projectID = `382dc20d-4641-4325-8e48-3b0462b703e9`
    const title     = `Private Test Project with Permissions: Languages`
    cy.visit(`/projects/${ projectID }/languages`)
    cy.get(`.page-title`).should(`have.text`, title)
    cy.get(`.languages-table caption`).should(`have.text`, title)
    cy.get(`.languages-table tbody`).children().should(`have.length`, 1)
    cy.contains(`td`, `Private Test Language with Permissions`)
  })

})
