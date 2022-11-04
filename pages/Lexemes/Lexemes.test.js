import { msAuthCookie } from '../../constants/index.js'

describe(`Lexemes Page`, function() {

  const privateLanguageID = `4580756f-ce39-4ea0-b96e-8f176371afcb` // Swahili language
  const privateProjectID  = `a24157c1-000f-4771-aa47-485fb91bf24f` // Swahili project

  describe(`/languages`, function() {

    it(`displays a 404 page for nonexistent languages`, function() {
      cy.visit(`/languages/1234/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Item Not Found`)
      cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
      cy.get(`.error-message`).should(`have.text`, `No language exists with ID 1234.`)
    })

    it(`displays an Unauthenticated error for private languages`, function() {
      cy.visit(`/languages/${ privateLanguageID }/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Unauthenticated`)
      cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
      cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this language.`)
    })

    it(`displays an Unauthorized error for private languages`, function() {
      cy.visit(`/`)
      cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
      cy.visit(`/languages/${ privateLanguageID }/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Unauthorized`)
      cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
      cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this language.`)
    })

    it(`displays lexemes for a language`, function() {

      const publicLanguageID = `850f3bd9-2a57-4289-bc57-05640b5d8d7d` // Plains Cree

      cy.visit(`/languages/${ publicLanguageID }/lexemes`)
      cy.title().should(`eq`, `Oxalis | Plains Cree | Lexemes`)
      cy.get(`tbody`).children().should(`have.length`, 3)
      cy.contains(`.lemma`, `cīkahikan`)
      cy.contains(`.lemma`, `masinahikan`)
      cy.contains(`.lemma`, `maskwa`)

    })

  })

  describe(`/projects`, function() {

    it(`displays a 404 page for nonexistent projects`, function() {
      cy.visit(`/projects/1234/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Item Not Found`)
      cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
      cy.get(`.error-message`).should(`have.text`, `No project exists with ID 1234.`)
    })

    it(`displays an Unauthenticated error for private projects`, function() {
      cy.visit(`/projects/${ privateProjectID }/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Unauthenticated`)
      cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
      cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this project.`)
    })

    it(`displays an Unauthorized error for private projects`, function() {
      cy.visit(`/`)
      cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
      cy.visit(`/projects/${ privateProjectID }/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Unauthorized`)
      cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
      cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this project.`)
    })

    it(`displays the lexemes for a project`, function() {

      const publicProjectID = `c554474c-7f39-4ede-941b-c40b8f58b059` // Nisinoon

      cy.visit(`/projects/${ publicProjectID }/lexemes`)
      cy.title().should(`eq`, `Oxalis | Nisinoon | Lexemes`)
      cy.get(`tbody`).children().should(`have.length`, 11)
      cy.contains(`.lemma`, `cīkahikan`)
      cy.contains(`.lemma`, `sūniyanikamekmahka͞esen`).should(`not.exist`)

    })

  })

})
