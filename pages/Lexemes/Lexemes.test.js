import yamlParser from 'js-yaml'

import Language    from '../../models/Language.js'
import Lexeme      from '../../models/Lexeme.js'
import Permissions from '../../models/Permissions.js'
import Project     from '../../models/Project.js'

const badID        = `bad-id`
const msAuthCookie = Cypress.env(`msAuthCookie`)

describe(`Lexemes`, function() {

  describe(`/languages`, function() {

    it(`404: Language Not Found`, function() {

      // SETUP

      const lexeme = new Lexeme({
        id: `ae4e6f0c-994a-400a-a47b-65f61eaaa65d`,
      })

      cy.addOne(lexeme)

      cy.visit(`/languages/${ badID }/lexemes`, { failOnStatusCode: false })

      // ASSERTIONS

      cy.contains(`.page-title`, `404: Item Not Found`)
      cy.contains(`.error-message`, `No language exists with ID ${ badID }.`)

    })

    it.only(`401: Unauthenticated`, function() {

      // SETUP

      const project = new Project({
        id:          `5ac8da11-ad52-4705-8f10-cce06d45e2a0`,
        permissions: new Permissions({ public: false }),
      })

      const language = new Language({
        id: `09b9550d-95bd-408d-868e-32f655f33987`,
      })

      const lexeme = new Lexeme({
        id:       `f8c33b57-d45f-4728-93a1-657da2990c49`,
        language: new Language({
          id: language.id,
        }),
        projects: [project.id],
      })

      cy.addOne(project)
      cy.addOne(language)
      cy.addOne(lexeme)

      cy.visit(`/languages/${ language.id }/lexemes`, { failOnStatusCode: false })

      // ASSERTIONS

      cy.contains(`.page-title`, `401: Unauthorized`)

    })

    it(`403: Unauthorized`)

    it(`200: Lexemes`)

  })

  describe(`/projects`, function() {

    it(`404: Project Not Found`)

    it(`401: Unauthenticated`)

    it(`403: Unauthorized`)

    it(`200: Lexemes`)

  })


})

describe.skip(`Lexemes Page`, function() {

  const publicLanguageID  = `850f3bd9-2a57-4289-bc57-05640b5d8d7d` // Plains Cree
  const publicProjectID   = `c554474c-7f39-4ede-941b-c40b8f58b059` // Nisinoon
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

      cy.readFile(`data/lexemes.yml`)
      .then(yaml => yamlParser.load(yaml))
      .then(data => {

        const lexemes = data.filter(lexeme => lexeme.language === publicLanguageID)

        cy.visit(`/languages/${ publicLanguageID }/lexemes`)
        cy.title().should(`eq`, `Oxalis | Lexemes`)
        cy.get(`.page-title`).should(`have.text`, `Plains Cree`)
        cy.get(`tbody`).children().should(`have.length`, lexemes.length)

        // check for correct page nav
        cy.contains(`.page-nav a`, `Language`)
        cy.contains(`.page-nav a`, `Lexicon`)
        cy.contains(`.page-nav a`, `Projects`)

        // check for the existence of a few expected lexemes
        cy.contains(`.lemma`, `cīkahikan`)
        cy.contains(`.lemma`, `masinahikan`)
        cy.contains(`.lemma`, `maskwa`)
        cy.contains(`.lemma`, `kotiskāwēwatim`)

        // check all the data for one lexeme
        const lexemeID = `f97938d3-255e-459b-8ea4-bcb858b95b92`
        cy.get(`[data-id="${ lexemeID }"]`).within(() => {

          cy.contains(`.lemma`, `‑âpisk(w)‑`)
          cy.contains(`.language`, `Plains Cree`)
          cy.get(`.glosses`).should(`contain.text`, `stone`).should(`contain.text`, `metal`)
          cy.contains(`.date-created`, new Date(`2022-01-01`).toLocaleDateString(`en-CA`))
          cy.contains(`.date-modified`, new Date(`2022-01-02`).toLocaleDateString(`en-CA`))

        })

      })

    })

    it(`displays unattested forms with an asterisk`, function() {
      const protoAlgicLanguageID = `2f8c9c1d-b08b-4b51-a016-b65a90eb8af8`
      cy.visit(`/languages/${ protoAlgicLanguageID }/lexemes`)
      cy.contains(`.lemma`, `*‑ahw`)
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

      cy.readFile(`data/lexemes.yml`)
      .then(yaml => yamlParser.load(yaml))
      .then(data => {

        const lexemes = data.filter(lexeme => lexeme.projects.includes(publicProjectID))

        cy.visit(`/projects/${ publicProjectID }/lexemes`)
        cy.title().should(`eq`, `Oxalis | Lexemes`)

        // check for correct page nav
        cy.contains(`.page-nav a`, `Project`)
        cy.contains(`.page-nav a`, `Languages`)
        cy.contains(`.page-nav a`, `Lexicon`)

        cy.get(`tbody`).children().should(`have.length`, lexemes.length)
        cy.contains(`.lemma`, `cīkahikan`)
        cy.contains(`.lemma`, `sūniyanikamekmahka͞esen`).should(`not.exist`)

      })

    })

  })

})
