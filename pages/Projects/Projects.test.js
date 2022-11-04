import { msAuthCookie } from '../../constants/index.js'

describe(`Projects`, function() {

  it(`displays public projects`, function() {
    cy.visit(`/projects`)
    cy.title().should(`eq`, `Oxalis | Projects`)
    cy.get(`.projects-list`).children().should(`have.length`, 1)
  })

  it(`displays private projects`, function() {
    cy.visit(`/projects`)
    cy.setCookie(msAuthCookie, `owner@digitallinguistics.io`)
    cy.visit(`/projects`)
    cy.get(`.projects-list`).children().should(`have.length`, 4)
  })

})
