import prepareTranscription from '../../utilities/prepareTranscription.js'
import yamlParser           from 'js-yaml'

import {
  Language,
  Lexeme,
  Permissions,
  Project,
} from '@digitallinguistics/models'

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

    it(`401: Unauthenticated`, function() {

      const language = new Language({
        id:          crypto.randomUUID(),
        permissions: new Permissions({
          public: false,
        }),
      })

      const lexeme = new Lexeme({
        language: language.getReference(),
      })

      cy.task(`seedOne`, [METADATA, language])
      cy.task(`seedOne`, [DATA, lexeme])
      cy.visit(`/languages/${ language.id }/lexemes`, { failOnStatusCode: false })
      cy.contains(`.page-title`, `401: Unauthenticated`)
      cy.contains(`.error-message`, `You must be logged in to view this language.`)

    })

    it(`403: Unauthorized`, function() {

      const language = new Language({
        id:          crypto.randomUUID(),
        permissions: new Permissions({
          public: false,
        }),
      })

      const lexeme = new Lexeme({
        language: language.getReference(),
      })

      cy.task(`seedOne`, [METADATA, language])
      cy.task(`seedOne`, [DATA, lexeme])
      cy.visit(`/languages/${ language.id }/lexemes`, { failOnStatusCode: false })
      cy.setCookie(msAuthCookie, msAuthUser)
      cy.reload()
      cy.contains(`.page-title`, `403: Unauthorized`)
      cy.contains(`.error-message`, `You do not have permission to view this language.`)

    })

    it(`404: Language Not Found`, function() {

      const lexeme = new Lexeme({
        id:       crypto.randomUUID(),
        language: {
          id:   crypto.randomUUID(),
          name: {},
        },
      })

      cy.task(`seedOne`, [DATA, lexeme])
      cy.visit(`/languages/${ badID }/lexemes`, { failOnStatusCode: false })
      cy.contains(`.page-title`, `404: Item Not Found`)
      cy.contains(`.error-message`, `No language exists with ID ${ badID }.`)

    })

    describe(`200: Lexemes`, function() {

      // NOTE: I'm using a `describe()` method here because it allows for a before hook,
      // and this makes the code much easier to read (instead of nesting `readFile()` calls).

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

        cy.task(`seedOne`, [METADATA, project])
        cy.task(`seedOne`, [METADATA, language])
        cy.task(`seedOne`, [DATA, lexeme])

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

          cy.contains(`.date-created`, new Date(lexeme.dateCreated).toLocaleDateString())
          cy.contains(`.date-modified`, new Date(lexeme.dateModified).toLocaleDateString())

        })

      })

    })

    it(`displays unattested forms with an asterisk`, function() {

      // SETUP

      const project  = new Project({ id: crypto.randomUUID() })
      const language = new Language({ id: crypto.randomUUID() })

      const lexeme = new Lexeme({
        id:       crypto.randomUUID(),
        language: language.getReference(),
        lemma:    {
          transcription: {
            Modern: `cuw-`,
            APA:    `čuw-`,
            IPA:    `t͡ʃuw-`,
          },
          unattested: true,
        },
        projects: [project.getReference()],
      })

      cy.task(`seedOne`, [METADATA, project])
      cy.task(`seedOne`, [METADATA, language])
      cy.task(`seedOne`, [DATA, lexeme])

      // ASSERTIONS

      cy.visit(`/languages/${ language.id }/lexemes`)
      cy.contains(`.lemma`, `*cuw‑`) // non-breaking hyphen

    })

    it(`search`, function() {

      // SETUP

      const count    = 3
      const language = new Language({ id: crypto.randomUUID() })

      const target = new Lexeme({
        language,
        lemma: {
          transcription: {
            en: `target`,
          },
        },
        target: true,
      })

      const distractor = new Lexeme({
        language,
        lemma: {
          transcription: {
            en: `distractor`,
          },
        },
      })

      cy.task(`seedOne`, [METADATA, language])
      cy.task(`seedMany`, [DATA, count, target])
      cy.task(`seedMany`, [DATA, count, distractor])

      // ACT

      cy.visit(`/languages/${ language.id }/lexemes`)
      cy.get(`#quicksearch`).type(`target`)
      cy.get(`.search-form button.btn`).click()
      cy.get(`tbody`).children().should(`have.length`, count)
      cy.get(`.search-form a.btn`).click()
      cy.get(`tbody`).children().should(`have.length`, count * 2)

      // ASSERT

    })

  })

  describe(`/projects`, function() {

    it(`401: Unauthenticated`, function() {

      const project = new Project({
        id:          crypto.randomUUID(),
        permissions: new Permissions({ public: false }),
      })

      cy.task(`seedOne`, [METADATA, project])

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

      cy.task(`seedOne`, [METADATA, project])

      cy.visit(`/projects/${ project.id }/lexemes`, { failOnStatusCode: false })
      cy.setCookie(msAuthCookie, msAuthUser)
      cy.reload()

      cy.title().should(`eq`, `Oxalis | Unauthorized`)
      cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
      cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this project.`)

    })

    it(`404: Project Not Found`, function() {
      cy.visit(`/projects/${ badID }/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Item Not Found`)
      cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
      cy.get(`.error-message`).should(`have.text`, `No project exists with ID ${ badID }.`)
    })


    it(`200: Lexemes`, function() {

      const project  = new Project({ id: crypto.randomUUID() })
      const language = new Language({ id: crypto.randomUUID() })

      const lexeme = new Lexeme({
        language: language.getReference(),
        projects: [project.getReference()],
      })

      const count = 3

      cy.task(`seedOne`, [METADATA, project])
      cy.task(`seedMany`, [DATA, count, lexeme])

      cy.visit(`/projects/${ project.id }/lexemes`)

      cy.get(`tbody`).children().should(`have.length`, count)

    })

  })

  describe(`variable permissions`, function() {

    it(`changes visibility for language vs. project`, function() {

      const language = new Language({
        id:          crypto.randomUUID(),
        permissions: new Permissions({
          public: false,
        }),
      })

      const project = new Project({
        id: crypto.randomUUID(),
      })

      const lexeme = new Lexeme({
        language: language.getReference(),
        projects: [project.getReference()],
      })

      cy.task(`seedOne`, [METADATA, language])
      cy.task(`seedOne`, [METADATA, project])
      cy.task(`seedOne`, [DATA, lexeme])

      cy.visit(`/languages/${ language.id }/lexemes`, { failOnStatusCode: false }) // does not have access via language
      cy.visit(`/projects/${ project.id }/lexemes`)                                // has access via project

    })

  })

})
