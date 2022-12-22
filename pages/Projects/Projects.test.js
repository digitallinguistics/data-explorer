const msAuthCookie = Cypress.env(`msAuthCookie`)

describe(`Projects`, function() {

  it.only(`displays all public projects`, function() {
    cy.visit(`/projects`)
    cy.title().should(`eq`, `Oxalis | Projects`)
    cy.get(`.page-title`).should(`have.text`, `Projects`)
    cy.get(`.page-nav`).should(`not.exist`)
    cy.get(`.projects-list`).children().should(`have.length`, 1)
    cy.contains(`header`, `Nisinoon`)
  })

  it(`displays all private projects the user has permission to access (owner)`, function() {
    cy.visit(`/projects`)
    cy.setCookie(msAuthCookie, `owner@digitallinguistics.io`)
    cy.visit(`/projects`)
    cy.get(`.projects-list`).children().should(`have.length`, 4)
    cy.contains(`header`, `Chitimacha`)
    cy.contains(`header`, `Menominee`)
    cy.contains(`header`, `Nisinoon`)
    cy.contains(`header`, `Swahili`)
  })

  it(`displays all private projects the user has permission to access (editor)`, function() {
    cy.visit(`/projects`)
    cy.setCookie(msAuthCookie, `editor@digitallinguistics.io`)
    cy.visit(`/projects`)
    cy.get(`.projects-list`).children().should(`have.length`, 2)
    cy.contains(`header`, `Menominee`)
    cy.contains(`header`, `Nisinoon`)
  })

  it(`displays all private projects the user has permission to access (viewer)`, function() {
    cy.visit(`/projects`)
    cy.setCookie(msAuthCookie, `viewer@digitallinguistics.io`)
    cy.visit(`/projects`)
    cy.get(`.projects-list`).children().should(`have.length`, 2)
    cy.contains(`header`, `Chitimacha`)
    cy.contains(`header`, `Nisinoon`)
  })

  it(`displays all projects for a language`, function() {

    const menomineeLanguageID = `5fc405aa-a1a3-41e5-a80d-adb9dfbaa293`

    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `owner@digitallinguistics.io`)
    cy.visit(`/languages/${ menomineeLanguageID }/projects`)

    // check for correct page nav
    cy.contains(`.page-nav`, `Language`)
    cy.contains(`.page-nav`, `Lexicon`)
    cy.contains(`.page-nav`, `Projects`)

    cy.get(`.projects-list`).children().should(`have.length`, 2)
    cy.contains(`.project__header`, `Menominee Dictionary`)
    cy.contains(`.project__header`, `Nisinoon`)

  })

})
