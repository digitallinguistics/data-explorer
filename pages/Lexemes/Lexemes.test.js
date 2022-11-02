import { msAuthCookie } from '../../constants/index.js'

describe(`Lexemes Page`, function() {

  const privateLanguageID = `0a25188c-158b-4daf-bd17-5c4cdd6bd40b`
  const privateProjectID  = `198c9710-451c-413b-abf5-b3daa4c15156`

  it(`displays a 404 page for nonexistent projects`, function() {
    cy.visit(`/projects/bad-id/lexemes`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Item Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
    cy.get(`.error-message`).should(`have.text`, `This project does not exist.`)
  })

  it(`displays a 404 page for nonexistent languages`, function() {
    cy.visit(`/languages/bad-id/lexemes`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Item Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
    cy.get(`.error-message`).should(`have.text`, `This language does not exist.`)
  })

  it(`displays an Unauthenticated error for private projects`, function() {
    cy.visit(`/projects/${ privateProjectID }/lexemes`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthenticated`)
    cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
    cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this project.`)
  })

  it(`displays an Unauthenticated error for private languages`, function() {
    cy.visit(`/languages/${ privateLanguageID }/lexemes`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthenticated`)
    cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
    cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this language.`)
  })

  it(`displays an Unauthorized error for private projects`, function() {
    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
    cy.visit(`/projects/${ privateProjectID }/lexemes`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthorized`)
    cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
    cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this project.`)
  })

  it(`displays an Unauthorized error for private languages`, function() {
    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
    cy.visit(`/languages/${ privateLanguageID }/lexemes`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthorized`)
    cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
    cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this language.`)
  })

  it(`displays the lexemes for a project`, function() {

    const publicProjectID = `6a0fcc10-859c-4af1-8105-156ccfd95310`

    cy.visit(`/projects/${ publicProjectID }/lexemes`)
    cy.title().should(`eq`, `Oxalis | Public Test Project | Lexemes`)
    cy.get(`tbody`).children().should(`have.length`, 2)
    cy.contains(`.lemma`, `cuw‑`)
    cy.contains(`.lemma`, `vivir`)

  })

  it(`displays lexemes for a language`, function() {

    const publicLanguageID = `3876b870-e7cd-46d2-bca8-2db1cd0a51ac`

    cy.visit(`/languages/${ publicLanguageID }/lexemes`)
    cy.title().should(`eq`, `Oxalis | Public Test Language | Lexemes`)
    cy.get(`tbody`).children().should(`have.length`, 2)
    cy.contains(`.lemma`, `correr`)
    cy.contains(`.lemma`, `vivir`)

  })

})
