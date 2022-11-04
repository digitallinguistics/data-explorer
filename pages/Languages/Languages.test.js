import { msAuthCookie } from '../../constants/index.js'

describe(`Languages`, function() {

  describe(`/languages`, function() {

    it(`displays all public languages`, function() {
      cy.visit(`/languages`)
      cy.title().should(`eq`, `Oxalis | Languages`)
      cy.get(`.page-title`).should(`have.text`, `Languages`)
      cy.get(`.languages-table caption`).should(`have.text`, `Languages`)
      cy.get(`.languages-table tbody`).children().should(`have.length`, 4)
      cy.contains(`td`, `Chitimacha`).should(`not.exist`)
      cy.contains(`td`, `Swahili`).should(`not.exist`)
    })

    it(`displays all private languages the user has permission to access (owner@digitallinguistics.io)`, function() {
      cy.visit(`/languages`)
      cy.setCookie(msAuthCookie, `owner@digitallinguistics.io`)
      cy.visit(`/languages`)
      cy.get(`.languages-table tbody`).children().should(`have.length`, 6)
    })

    it(`displays all private languages the user has permission to access (editor@digitallinguistics.io)`, function() {
      cy.visit(`/languages`)
      cy.setCookie(msAuthCookie, `editor@digitallinguistics.io`)
      cy.visit(`/languages`)
      cy.get(`.languages-table tbody`).children().should(`have.length`, 4)
      cy.contains(`td`, `Menominee`)
    })

    it(`displays all private languages the user has permission to access (viewer@digitallinguistics.io)`, function() {
      cy.visit(`/languages`)
      cy.setCookie(msAuthCookie, `viewer@digitallinguistics.io`)
      cy.visit(`/languages`)
      cy.get(`.languages-table tbody`).children().should(`have.length`, 5)
      cy.contains(`td`, `Chitimacha`)
    })

  })

  describe(`/projects/{projectID}/languages`, function() {

    it(`displays a 404 page for nonexistent projects`)

    it(`displays an Unauthenticated error for private projects`)

    it(`displays an Unauthorized error for private projects`)

    it(`displays all (and only all) project languages`)

  })

})
