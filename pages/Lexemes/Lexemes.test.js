import prepareTranscription from '../../utilities/prepareTranscription.js'
import yamlParser           from 'js-yaml'

import Language    from '../../models/Language.js'
import Lexeme      from '../../models/Lexeme.js'
import Permissions from '../../models/Permissions.js'
import Project     from '../../models/Project.js'

const badID        = `bad-id`
const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

describe(`Lexemes`, function() {

  before(function() {
    cy.task(`setupDatabase`)
  })

  afterEach(function() {
    cy.clearDatabase()
  })

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

    // 401: Unauthenticated: Won't do this because permissions don't exist on languages.
    // 403: Unauthorized: Won't do this because permissions don't exist on languages.

    it(`200: Lexemes (data)`, function() {

      // SETUP

      cy.readFile(`data/language.yml`)
      .then(yaml => yamlParser.load(yaml))
      .then(language => {

        cy.readFile(`data/lexeme.yml`)
        .then(yaml => yamlParser.load(yaml))
        .then(lexeme => {

          cy.readFile(`data/project.yml`)
          .then(yaml => yamlParser.load(yaml))
          .then(project => {

            cy.addOne(project)
            cy.addOne(language)
            cy.addOne(lexeme)

            cy.visit(`/languages/${ language.id }/lexemes`)

            // ASSERTIONS

            cy.title().should(`eq`, `Oxalis | Lexemes`)
            cy.get(`.page-title`).should(`have.text`, language.name.eng)
            cy.get(`tbody`).children().should(`have.length`, 1)

            // check for correct page nav
            cy.contains(`.page-nav a`, `Language`)
            cy.contains(`.page-nav a`, `Lexicon`)
            cy.contains(`.page-nav a`, `Projects`)

            cy.get(`[data-id="${ lexeme.id }"]`).within(() => {

              cy.contains(`.lemma`, prepareTranscription(lexeme.lemma.transcription.Modern))
              cy.contains(`.language`, lexeme.language.name.eng)

              const emDash = `—`

              for (const sense of lexeme.senses) {
                cy.contains(`.glosses`, sense.gloss?.eng ?? emDash)
              }

              cy.contains(`.date-created`, new Date(lexeme.dateCreated).toLocaleDateString(`en-CA`))
              cy.contains(`.date-modified`, new Date(lexeme.dateModified).toLocaleDateString(`en-CA`))

            })

          })

        })

      })

    })

    it(`200: Lexemes (permissions)`, function() {

      // SETUP

      const publicProject = new Project({
        id: `fadb31c3-4a3b-421b-929e-a71cfb1d764e`,
      })

      const userProject = new Project({
        id:          `32e9ae9f-a774-4710-b317-012445e98664`,
        permissions: new Permissions({
          owners: [msAuthUser],
          public: false,
        }),
      })

      const privateProject = new Project({
        id:          `6e249e2a-e2d8-444a-8539-9e9909552090`,
        permissions: new Permissions({
          public: false,
        }),
      })

      const language = new Language({
        id: `8b4ed0f5-ee34-4e4f-92e4-d6238d7c8520`,
      })

      const count = 3

      cy.addOne(publicProject)
      cy.addOne(userProject)
      cy.addOne(privateProject)
      cy.addOne(language)

      cy.addMany(count, new Lexeme({
        language: {
          id:   language.id,
          name: {},
        },
        projects: [publicProject.id],
      }))

      cy.addMany(count, new Lexeme({
        language: {
          id:   language.id,
          name: {},
        },
        projects: [userProject.id],
      }))

      cy.addMany(count, new Lexeme({
        language: {
          id:   language.id,
          name: {},
        },
        projects: [privateProject.id],
      }))

      cy.visit(`/languages/${ language.id }/lexemes`)

      // ASSERTIONS

      cy.get(`tbody`).children().should(`have.length`, count)
      cy.setCookie(msAuthCookie, msAuthUser)
      cy.reload()
      cy.get(`tbody`).children().should(`have.length`, count * 2)

    })

    it(`displays unattested forms with an asterisk`, function() {

      // SETUP

      const project  = new Project({ id: `c989242e-f98b-4852-9e32-e35b25c3c10f` })
      const language = new Language({ id: `1cdda80c-e629-4918-8464-79f259adcc69` })

      const lexeme = new Lexeme({
        id:       `174bc2cb-d0b0-4364-b357-722ae0dcf3ce`,
        language: {
          id: language.id,
        },
        lemma: {
          transcription: {
            Modern: `cuw-`,
            APA:    `čuw-`,
            IPA:    `t͡ʃuw-`,
          },
          unattested: true,
        },
        projects: [project.id],
      })

      cy.addOne(project)
      cy.addOne(language)
      cy.addOne(lexeme)

      // ASSERTIONS

      cy.visit(`/languages/${ language.id }/lexemes`)
      cy.contains(`.lemma`, `*cuw‑`) // non-breaking hyphen

    })

  })

  describe(`/projects`, function() {

    it(`404: Project Not Found`, function() {
      cy.visit(`/projects/${ badID }/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Item Not Found`)
      cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
      cy.get(`.error-message`).should(`have.text`, `No project exists with ID ${ badID }.`)
    })

    it(`401: Unauthenticated`, function() {

      const project = new Project({
        id:          `700885ee-952b-4923-802c-4e1a2f6313a7`,
        permissions: new Permissions({ public: false }),
      })

      cy.addOne(project)

      cy.visit(`/projects/${ project.id }/lexemes`, { failOnStatusCode: false })

      cy.title().should(`eq`, `Oxalis | Unauthenticated`)
      cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
      cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this project.`)

    })

    it(`403: Unauthorized`, function() {

      const project = new Project({
        id:          `e28a5cfa-901a-44f9-a192-a1241ed60db0`,
        permissions: new Permissions({
          public: false,
        }),
      })

      cy.addOne(project)

      cy.visit(`/projects/${ project.id }/lexemes`, { failOnStatusCode: false })
      cy.setCookie(msAuthCookie, msAuthUser)
      cy.reload()

      cy.title().should(`eq`, `Oxalis | Unauthorized`)
      cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
      cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this project.`)

    })

    it(`200: Lexemes`, function() {

      const project = new Project({ id: `cce2b576-4d24-4356-a6c2-6d5ac6b7b6bb` })

      cy.addOne(project)

      const count = 3

      cy.addMany(count, new Lexeme({
        projects: [project.id],
      }))

      cy.visit(`/projects/${ project.id }/lexemes`)

      cy.get(`tbody`).children().should(`have.length`, count)

    })

  })

})
