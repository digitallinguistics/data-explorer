import prepareTranscription from '../../utilities/prepareTranscription.js'
import yamlParser           from 'js-yaml'

import Language    from '../../models/Language.js'
import Lexeme      from '../../models/Lexeme.js'
import Permissions from '../../models/Permissions.js'
import Project     from '../../models/Project.js'

const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

const emDash = `—`

describe(`Lexeme`, function() {

  it(`Not Found`, function() {

    const badID    = `bad-id`
    const language = new Language({ id: `642ca288-3e38-4f16-8789-1506028d13b4` })

    cy.addOne(language)

    cy.visit(`/languages/${ language.id }/lexemes/${ badID }`, { failOnStatusCode: false })
    cy.contains(`.page-title`, `404: Item Not Found`)
    cy.contains(`.error-message`, `No lexeme exists with ID ${ badID }.`)

  })

  it(`Unauthenticated`, function() {

    const language = new Language({ id: `35ba99b6-9e81-4052-8e8f-148b814b57f3` })
    const lexeme   = new Lexeme({
      id:       `1a3ca796-dfce-4688-9e93-f736a228d176`,
      language: {
        id: language.id,
      },
      permissions: {
        public: false,
      },
    })

    cy.addOne(language)
    cy.addOne(lexeme)

    cy.visit(`/languages/${ language.id }/lexemes/${ lexeme.id }`, { failOnStatusCode: false })
    cy.contains(`.page-title`, `401: Unauthenticated`)
    cy.contains(`.error-message`, `You must be logged in to view this lexeme.`)

  })

  it(`Unauthorized`, function() {

    const language = new Language({ id: `35ba99b6-9e81-4052-8e8f-148b814b57f3` })
    const lexeme = new Lexeme({
      id:       `1a3ca796-dfce-4688-9e93-f736a228d176`,
      language: {
        id: language.id,
      },
      permissions: {
        public: false,
      },
    })

    cy.addOne(language)
    cy.addOne(lexeme)

    cy.visit(`/`)
    cy.setCookie(msAuthCookie, msAuthUser)
    cy.visit(`/languages/${ language.id }/lexemes/${ lexeme.id }`, { failOnStatusCode: false })
    cy.contains(`.page-title`, `403: Unauthorized`)
    cy.contains(`.error-message`, `You do not have permission to view this lexeme.`)

  })

  it(`Lexeme Details`, function() {

    cy.readFile(`data/language.yml`)
    .then(yaml => yamlParser.load(yaml))
    .then(language => {

      cy.readFile(`data/lexeme.yml`)
      .then(yaml => yamlParser.load(yaml))
      .then(lexeme => {

        cy.readFile(`data/project.yml`)
        .then(yaml => yamlParser.load(yaml))
        .then(project => {

          const typologyProject = new Project({
            id:   `56b6e164-cf90-4e83-835e-d8e92ed11778`,
            name: `Typology Project`,
          })

          cy.addOne(language)
          cy.addOne(lexeme)
          cy.addOne(project)
          cy.addOne(typologyProject)
          cy.visit(`/languages/${ language.id }/lexemes/${ lexeme.id }`)

          // HEADER

          // Headword
          cy.contains(`.headword`, prepareTranscription(lexeme.lemma.transcription.Modern))

          // Language
          cy.contains(`.language`, `${ language.name.eng } | ${ language.autonym.Modern }`)

          // Glosses
          cy.get(`.glosses`).children()
          .should(`have.length`, lexeme.senses.length)
          .then(([a, b, c]) => {
            expect(a).to.contain.text(lexeme.senses[0].gloss.eng)
            expect(b).to.contain.text(lexeme.senses[1].gloss.eng)
            expect(c).to.contain.text(emDash)
          })

          // FORMS

          // Lemma
          for (const ortho in lexeme.lemma.transcription) {
            cy.contains(`#lemma dt`, ortho)
            cy.contains(`#lemma dd`, prepareTranscription(lexeme.lemma.transcription[ortho]))
          }

          // Citation Form
          for (const ortho in lexeme.citationForm) {
            cy.contains(`#citation-form dt`, ortho)
            cy.contains(`#citation-form dd`, prepareTranscription(lexeme.citationForm[ortho]))
          }

          // Morph Type
          cy.contains(`#morph-type`, lexeme.morphType.eng)

          // Slot
          cy.contains(`#slot`, lexeme.slot.eng)

          // Base Forms
          cy.get(`.forms-list`).children().should(`have.length`, lexeme.forms.length)

          // FORM

          const [form] = lexeme.forms

          // Summary
          const summary = `#${ form.id } summary`

          for (const ortho in form.transcription) {
            cy.contains(summary, ortho)
            cy.contains(summary, prepareTranscription(form.transcription[ortho]))
          }

          // Abstract Form
          cy.get(`#form-${ form.id }__abstract`).should(`be.checked`)

          // Unattested
          cy.get(`#form-${ form.id }__unattested`).should(`be.checked`)

          // Allomorphs
          const allomorphsID = `#form-${ form.id }__allomorphs`

          cy.get(allomorphsID).children()
          .should(`have.length`, form.allomorphs.length)

          const firstAllomorph = `${ allomorphsID } .allomorph:first-child`

          cy.contains(firstAllomorph, prepareTranscription(form.allomorphs[0].transcription.Modern))
          cy.contains(firstAllomorph, prepareTranscription(form.allomorphs[0].environments[0]))

          // Components
          cy.get(`#form-${ form.id }__components`).children()
          .should(`have.length`, form.components.length)
          .then(([a, b]) => {
            expect(a).to.contain.text(prepareTranscription(form.components[0].transcription.Modern))
            expect(b).to.contain.text(prepareTranscription(`*${ form.components[1].transcription.Modern }`))
          })

          // Component Of
          cy.get(`#form-${ form.id }__component-of`).children()
          .should(`have.length`, form.componentOf.length)
          .then(([a, b]) => {
            expect(a).to.contain.text(prepareTranscription(form.componentOf[0].transcription.Modern))
            expect(b).to.contain.text(prepareTranscription(`*${ form.componentOf[1].transcription.Modern }`))
          })

          // Etymology
          cy.get(`#form-${ form.id }__etymology`).children()
          .should(`have.length`, form.etymology.length + form.etymology.length - 1)
          .then(([a, , c]) => {
            expect(a).to.contain.text(prepareTranscription(`*${ form.etymology[0].transcription.APA }`))
            expect(a).to.contain.text(form.etymology[0].language.abbreviation)
            expect(c).to.contain.text(prepareTranscription(`*${ form.etymology[1].transcription.APA }`))
            expect(c).to.contain.text(form.etymology[1].language.abbreviation)
          })

          // Reflexes
          cy.get(`#form-${ form.id }__reflexes`).children()
          .should(`have.length`, form.reflexes.length)
          .then(([a, b]) => {
            expect(a).to.contain.text(prepareTranscription(form.reflexes[0].transcription.Modern))
            expect(a).to.contain.text(form.reflexes[0].language.abbreviation)
            expect(b).to.contain.text(prepareTranscription(form.reflexes[1].transcription.Modern))
            expect(b).to.contain.text(form.reflexes[1].language.abbreviation)
          })

          // References
          cy.get(`#form-${ form.id }__references ul`).children()
          .should(`have.length`, form.bibliography.length)
          .then(([a, b]) => {
            expect(a).to.contain.text(form.bibliography[0].citation)
            expect(b).to.contain.text(form.bibliography[1].citation)
          })

          // Sources
          cy.get(`#form-${ form.id }__sources`).children()
          .should(`have.length`, form.sources.length)
          .then(([a, b]) => {
            expect(a).to.contain.text(form.sources[0].abbreviation)
            expect(b).to.contain.text(form.sources[1].abbreviation)
          })

          // SENSES

          cy.get(`#meaning-link`).click()
          cy.get(`.senses-list`).children().should(`have.length`, lexeme.senses.length)

          // SENSE

          const [sense] = lexeme.senses

          // Gloss
          cy.get(`#sense-${ sense.id }__gloss`).should(`contain.text`, sense.gloss.eng)

          // Category
          cy.get(`#sense-${ sense.id }__category`)
          .should(`contain.text`, sense.category.abbreviation)
          .should(`have.attr`, `title`, sense.category.name.eng)

          // Semantic Class
          cy.get(`#sense-${ sense.id }__semantic-class`)
          .should(`contain.text`, sense.semanticClass.abbreviation)
          .should(`have.attr`, `title`, sense.semanticClass.name.eng)

          // Inflection Class
          cy.get(`#sense-${ sense.id }__inflection-class`)
          .should(`contain.text`, sense.inflectionClass.abbreviation)
          .should(`have.attr`, `title`, sense.inflectionClass.name.eng)

          // Base Category
          cy.get(`#sense-${ sense.id }__base-category`)
          .should(`contain.text`, sense.baseCategory.abbreviation)
          .should(`have.attr`, `title`, sense.baseCategory.name.eng)

          // METADATA

          cy.get(`#metadata-link`).click()

          // Cross References
          cy.get(`#cross-references`).children()
          .should(`have.length`, 8)

          cy.get(`#cross-references`)
          .within(() => {

            cy.contains(`dt`, `Delphine`)
            cy.contains(`dd`, `cuwi`)
            cy.contains(`dt`, `compare`)
            cy.get(`.cross-refs-set`).children()
            .should(`have.length`, 2)
            .should(`include.text`, `nuhc‑`)  // non-breaking hyphen
            .should(`include.text`, `nicwa‑`) // non-breaking hyphen
            cy.contains(`dt`, `plural`)
            cy.contains(`dd`, `dut‑`)         // non-breaking hyphen
            cy.contains(`dt`, `pluractional`)
            cy.contains(`dd`, `dutma‑`)       // non-breaking hyphen

          })

          // Date Created
          cy.contains(`#date-created`, new Date(lexeme.dateCreated).toLocaleDateString(`en-CA`))

          // Date Modified
          cy.contains(`#date-modified`, new Date(lexeme.dateModified).toLocaleDateString(`en-CA`))

          // Language Name
          cy.get(`#language-name`)
          .within(() => {
            for (const lang in language.name) {
              cy.contains(`dt`, lang)
              cy.contains(`dd`, language.name[lang])
            }
          })

          // Language Autonym
          cy.get(`#language-autonym`)
          .within(() => {
            for (const ortho in language.autonym) {
              cy.contains(`dt`, ortho)
              cy.contains(`dd`, language.autonym[ortho])
            }
          })

          // Projects
          cy.get(`#projects`).children()
          .should(`have.length`, lexeme.projects.length)
          .then(([a, b]) => {
            expect(a).to.include.text(`Chitimacha Dictionary`)
            expect(b).to.include.text(`Typology Project`)
          })

          // References
          cy.get(`#lexeme__references ul`).children()
          .should(`have.length`, lexeme.bibliography.length)
          .then(([a, b]) => {
            expect(a).to.contain.text(lexeme.bibliography[0].citation)
            expect(b).to.contain.text(lexeme.bibliography[1].citation)
          })

          // Sources
          cy.get(`#lexeme__sources`).children()
          .should(`have.length`, lexeme.sources.length)

          for (const source of lexeme.sources) {
            cy.contains(`#lexeme__sources li`, source.abbreviation)
          }

          // Tags
          cy.get(`#tags`).children()
          .should(`have.length`, Object.keys(lexeme.tags).length)
          .then(([a, b, c, d, e]) => {
            expect(a).to.have.text(`checked: yes`)
            expect(b).to.have.text(`elicited`)
            expect(c).to.have.text(`compound: false`)
            expect(d).to.have.text(`preverbs: 0`)
            expect(e).to.have.text(`syllables: 2`)
          })

          // URL
          cy.contains(`#url`, `https://data.digitallinguistics.io/languages/${ language.id }/lexemes/${ lexeme.id }`)

          // Notes
          cy.get(`.lexeme__notes`).children()
          .should(`have.length`, lexeme.notes.length)

          for (const note of lexeme.notes) {
            cy.contains(`.note`, note.text)
          }

        })

      })

    })

  })

  it(`empty lexeme`, function() {

    // SETUP: Seed database

    const project = new Project({
      id:   `d12a00e6-a324-450f-8a06-7265b6eb5c33`,
      name: `Test Project`,
    })

    const language = new Language({
      id: `a64b2239-e094-49df-a2c4-b2a8c5e35f8c`,
    })

    const lexeme = new Lexeme({
      id:           `dc305010-fd42-4356-b4e9-a6eef7323119`,
      language:     {
        id: language.id,
      },
      projects: [project.id],
    })

    delete lexeme.dateCreated
    delete lexeme.dateModified

    cy.addOne(project)
    cy.addOne(language)
    cy.addOne(lexeme)

    // ASSERTIONS

    cy.visit(`/languages/1234/lexemes/${ lexeme.id }`)

    // HEADER

    // Lemma
    cy.contains(`.headword`, `[no lemma given]`)

    // Language
    cy.contains(`.language`, `[no language name given]`)

    // Glosses
    cy.get(`.glosses`).should(`not.exist`)

    // FORMS

    // Lemma
    cy.contains(`#lemma`, emDash)

    // Citation Form
    cy.contains(`#citation-form`, emDash)

    // Morph Type
    cy.contains(`#morph-type`, emDash)

    // Slot
    cy.contains(`#slot`, emDash)

    // Base Forms
    cy.get(`.forms-list`).should(`not.exist`)
    cy.contains(`.forms-section .summary-count`, `(${ lexeme.forms.length })`)

    // FORM
    // See separate test for empty form below

    // SENSES

    cy.get(`#meaning-link`).click()
    cy.get(`.senses-list`).should(`not.exist`)
    cy.contains(`#meaning`, `No senses listed.`)

    // SENSE
    // See separate test for empty sense below

    // METADATA

    cy.get(`#metadata-link`).click()

    // Cross References
    cy.contains(`#cross-references`, emDash)

    // Date Created
    cy.contains(`#date-created`, emDash)

    // Date Modified
    cy.contains(`#date-modified`, emDash)

    // Language Name
    cy.contains(`#language-name`, emDash)

    // Language Autonym
    cy.contains(`#language-autonym`, emDash)

    // Projects
    // A lexeme must have a project in order for the server
    // to render the page properly.
    cy.contains(`#projects`, project.name)

    // References
    cy.contains(`#lexeme__references`, emDash)

    // Sources
    cy.contains(`#lexeme__sources`, emDash)

    // Tags
    cy.contains(`#tags`, emDash)

    // URL: Already tested above

    // Notes
    cy.contains(`.notes-section .summary-count`, `(0)`)
    cy.get(`.lexeme__notes`).children().should(`have.length`, 0)

  })

  it(`empty form + empty sense`, function() {

    // SETUP

    const project = new Project({
      id:   `d12a00e6-a324-450f-8a06-7265b6eb5c33`,
      name: `Test Project`,
    })

    const language = new Language({
      id: `a64b2239-e094-49df-a2c4-b2a8c5e35f8c`,
    })

    const lexeme = new Lexeme({
      forms:    [
        {
          id: `60a80a96-02b0-4458-b3ed-cd6ff6179c5a`,
        },
      ],
      id:           `dc305010-fd42-4356-b4e9-a6eef7323119`,
      language:     {
        id: language.id,
      },
      projects: [project.id],
      senses:   [
        {
          id: `cffc430d-11b3-4a55-a383-7747bb3a1d15`,
        },
      ],
    })

    cy.addOne(project)
    cy.addOne(language)
    cy.addOne(lexeme)

    cy.visit(`/languages/1234/lexemes/${ lexeme.id }`)

    // ASSERTIONS

    // FORM

    let [{ id }] = lexeme.forms

    // Transcription
    cy.contains(`.form summary`, `[no transcription given]`)

    // Abstract Form
    cy.get(`#form-${ id }__abstract`).should(`not.be.checked`)

    // Unattested
    cy.get(`#form-${ id }__unattested`).should(`not.be.checked`)

    // Allomorphs
    cy.contains(`#form-${ id }__allomorphs`, emDash)

    // Components
    cy.contains(`#form-${ id }__components`, emDash)

    // Component Of
    cy.contains(`#form-${ id }__component-of`, emDash)

    // Etymology
    cy.contains(`#form-${ id }__etymology`, emDash)

    // Reflexes
    cy.contains(`#form-${ id }__reflexes`, emDash)

    // References
    cy.contains(`#form-${ id }__references`, emDash)

    // Sources
    cy.contains(`#form-${ id }__sources`, emDash)

    // SENSE

    ;[{ id }] = lexeme.senses // eslint-disable-line semi-style

    cy.get(`#meaning-link`).click()

    // Gloss
    cy.contains(`#sense-${ id }__gloss`, emDash)

    // Lexical Category
    cy.contains(`#sense-${ id }__category`, emDash)

    // Semantic Class
    cy.contains(`#sense-${ id }__semantic-class`, emDash)

    // Inflection Class
    cy.contains(`#sense-${ id }__inflection-class`, emDash)

    // Base Category
    cy.contains(`#sense-${ id }__base-category`, emDash)

  })

  // If a lexeme is part of both public and private projects,
  // only show the private projects if the user has access to them.
  it(`private projects`, function() {

    // SETUP

    const publicProject = new Project({
      id:   `b43470b6-24ab-41d7-acff-ff24dc299548`,
      name: `Public Project`,
    })

    const privateProject = new Project({
      id:          `4ef445ec-20e1-4755-b574-89626cabea87`,
      name:        `Private Project`,
      permissions: new Permissions({ public: false }),
    })

    const userProject = new Project({
      id:          `80c0998a-1091-466d-a99b-b71407693637`,
      name:        `User Project`,
      permissions: new Permissions({
        owners: [msAuthUser],
      }),
    })

    const language = new Language({
      id: `9bae693b-f953-4880-af23-683c9b374aa3`,
    })

    const lexeme = new Lexeme({
      id:       `15183462-fe10-439e-a90c-217d0a8777e3`,
      language: {
        id: language.id,
      },
      projects: [
        publicProject.id,
        privateProject.id,
        userProject.id,
      ],
    })

    cy.addOne(publicProject)
    cy.addOne(privateProject)
    cy.addOne(userProject)
    cy.addOne(language)
    cy.addOne(lexeme)

    cy.visit(`/languages/1234/lexemes/${ lexeme.id }`)
    cy.get(`#metadata-link`).click()

    // ASSERT

    cy.get(`#projects`).children()
    .should(`have.length`, 2)

  })

})
