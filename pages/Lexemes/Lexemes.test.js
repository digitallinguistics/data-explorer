import prepareTranscription from '../../utilities/prepareTranscription.js'
import yamlParser           from 'js-yaml'

import Language    from '../../models/Language.js'
import Lexeme      from '../../models/Lexeme.js'
import Permissions from '../../models/Permissions.js'
import Project     from '../../models/Project.js'

const badID        = `bad-id`
const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

const DATA     = `data`
const METADATA = `metadata`

describe(`Lexemes`, function() {

  before(function() {
    cy.task(`setupDatabase`)
  })

  afterEach(function() {
    cy.task(`clearDatabase`)
  })

  after(function() {
    cy.task(`deleteDatabase`)
  })

  describe(`/languages`, function() {

    it(`404: Language Not Found`, function() {

      const lexeme = new Lexeme({
        id:       crypto.randomUUID(),
        language: {
          id: crypto.randomUUID(),
        },
      })

      cy.seedOne(DATA, lexeme)
      cy.visit(`/languages/${ badID }/lexemes`, { failOnStatusCode: false })
      cy.contains(`.page-title`, `404: Item Not Found`)
      cy.contains(`.error-message`, `No language exists with ID ${ badID }.`)

    })

    // 401: Unauthenticated: Won't do this because permissions don't exist on languages.
    // 403: Unauthorized: Won't do this because permissions don't exist on languages.

    describe(`200: Lexemes (data)`, function() {

      before(function() {

        cy.readFile(`data/language.yml`)
        .then(yaml => yamlParser.load(yaml))
        .as(`language`)

        cy.readFile(`data/project.yml`)
        .then(yaml => yamlParser.load(yaml))
        .as(`project`)

        cy.readFile(`data/lexeme.yml`)
        .then(yaml => yamlParser.load(yaml))
        .as(`lexeme`)

      })

      it(`displays correctly`, function() {

        const { project, language, lexeme } = this

        cy.seedOne(METADATA, project)
        cy.seedOne(METADATA, language)
        cy.seedOne(DATA, lexeme)

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

    it(`200: Lexemes (permissions)`, function() {

      // SETUP

      const publicProject = new Project({
        id: crypto.randomUUID(),
      })

      const userProject = new Project({
        id:          crypto.randomUUID(),
        permissions: new Permissions({
          owners: [msAuthUser],
          public: false,
        }),
      })

      const privateProject = new Project({
        id:          crypto.randomUUID(),
        permissions: new Permissions({
          public: false,
        }),
      })

      const language = new Language({
        id: crypto.randomUUID(),
      })

      const count = 3

      cy.seedOne(METADATA, publicProject)
      cy.seedOne(METADATA, userProject)
      cy.seedOne(METADATA, privateProject)
      cy.seedOne(METADATA, language)

      cy.seedMany(DATA, count, new Lexeme({
        language: {
          id:   language.id,
          name: {},
        },
        projects: [publicProject.id],
      }))

      cy.seedMany(DATA, count, new Lexeme({
        language: {
          id:   language.id,
          name: {},
        },
        projects: [userProject.id],
      }))

      cy.seedMany(DATA, count, new Lexeme({
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

      const project  = new Project({ id: crypto.randomUUID() })
      const language = new Language({ id: crypto.randomUUID() })

      const lexeme = new Lexeme({
        id:       crypto.randomUUID(),
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

      cy.seedOne(METADATA, project)
      cy.seedOne(METADATA, language)
      cy.seedOne(DATA, lexeme)

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
        id:          crypto.randomUUID(),
        permissions: new Permissions({ public: false }),
      })

      cy.seedOne(METADATA, project)

      cy.visit(`/projects/${ project.id }/lexemes`, { failOnStatusCode: false })

      cy.title().should(`eq`, `Oxalis | Unauthenticated`)
      cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
      cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this project.`)

    })

    it(`403: Unauthorized`, function() {

      const project = new Project({
        id:          crypto.randomUUID(),
        permissions: new Permissions({
          public: false,
        }),
      })

      cy.seedOne(METADATA, project)

      cy.visit(`/projects/${ project.id }/lexemes`, { failOnStatusCode: false })
      cy.setCookie(msAuthCookie, msAuthUser)
      cy.reload()

      cy.title().should(`eq`, `Oxalis | Unauthorized`)
      cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
      cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this project.`)

    })

    it(`200: Lexemes`, function() {

      const project = new Project({ id: crypto.randomUUID() })

      const lexeme = new Lexeme({
        language: {
          id: crypto.randomUUID(),
        },
        projects: [project.id],
      })

      const count = 3

      cy.seedOne(METADATA, project)
      cy.seedMany(DATA, count, lexeme)

      cy.visit(`/projects/${ project.id }/lexemes`)

      cy.get(`tbody`).children().should(`have.length`, count)

    })

  })

})
