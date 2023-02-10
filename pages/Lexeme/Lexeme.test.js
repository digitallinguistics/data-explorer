import prepareTranscription from '../../utilities/prepareTranscription.js'
import yamlParser           from 'js-yaml'

import {
  Language,
  Lexeme,
  Permissions,
  Project,
} from '@digitallinguistics/models'

const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

const emDash   = `—`
const DATA     = `data`
const METADATA = `metadata`

describe(`Lexeme`, function() {

  before(function() {
    cy.task(`setupDatabase`)
  })

  afterEach(function() {
    cy.task(`clearDatabase`)
  })

  after(function() {
    cy.task(`deleteDatabase`)
  })

  it(`Not Found`, function() {

    const badID    = `bad-id`
    const language = new Language({ id: crypto.randomUUID() })

    cy.task(`seedOne`, [METADATA, language])

    cy.visit(`/languages/${ language.id }/lexemes/${ badID }`, { failOnStatusCode: false })
    cy.contains(`.page-title`, `404: Item Not Found`)
    cy.contains(`.error-message`, `No lexeme exists with ID ${ badID }.`)

  })

  it(`Unauthenticated`, function() {

    const language = new Language({
      id:          crypto.randomUUID(),
      permissions: new Permissions({
        public: false,
      }),
    })

    const lexeme = new Lexeme({
      id:       crypto.randomUUID(),
      language: language.getReference(),
    })

    cy.task(`seedOne`, [METADATA, language])
    cy.task(`seedOne`, [DATA, lexeme])

    cy.visit(`/languages/${ language.id }/lexemes/${ lexeme.id }`, { failOnStatusCode: false })
    cy.contains(`.page-title`, `401: Unauthenticated`)
    cy.contains(`.error-message`, `You must be logged in to view this lexeme.`)

  })

  it(`Unauthorized`, function() {

    const language = new Language({
      id:          crypto.randomUUID(),
      permissions: new Permissions({
        public: false,
      }),
    })

    const lexeme = new Lexeme({
      id:       crypto.randomUUID(),
      language: language.getReference(),
    })

    cy.task(`seedOne`, [METADATA, language])
    cy.task(`seedOne`, [DATA, lexeme])

    cy.visit(`/`)
    cy.setCookie(msAuthCookie, msAuthUser)
    cy.visit(`/languages/${ language.id }/lexemes/${ lexeme.id }`, { failOnStatusCode: false })
    cy.contains(`.page-title`, `403: Unauthorized`)
    cy.contains(`.error-message`, `You do not have permission to view this lexeme.`)

  })

  describe(`Lexeme Details`, function() {

    before(function() {

      // This Before hook is here just to setup the data for the following test.

      cy.readFile(`data/language.yml`)
      .then(yaml => yamlParser.load(yaml))
      .as(`language`)

      cy.readFile(`data/lexeme.yml`)
      .then(yaml => yamlParser.load(yaml))
      .as(`lexeme`)

      cy.readFile(`data/project.yml`)
      .then(yaml => yamlParser.load(yaml))
      .as(`project`)

    })

    it(`display correctly`, function() {

      const { language, lexeme, project } = this

      const typologyProject = new Project({
        id:   crypto.randomUUID(),
        name: { eng: `Typology Project` },
      })

      lexeme.projects.push(typologyProject.getReference())

      cy.task(`seedOne`, [METADATA, new Language(language)])
      cy.task(`seedOne`, [METADATA, new Project(project)])
      cy.task(`seedOne`, [METADATA, new Project(typologyProject)])
      cy.task(`seedOne`, [DATA, new Lexeme(lexeme)])

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

  it(`empty lexeme`, function() {

    // SETUP: Seed database

    const project = new Project({
      id:   crypto.randomUUID(),
      name: { eng: `Test Project` },
    })

    const language = new Language({
      id:   crypto.randomUUID(),
      name: {},
    })

    const lexeme = new Lexeme({
      id:       crypto.randomUUID(),
      language: language.getReference(),
      projects: [project.getReference()],
    })

    delete lexeme.dateCreated
    delete lexeme.dateModified

    cy.task(`seedOne`, [METADATA, project])
    cy.task(`seedOne`, [METADATA, language])
    cy.task(`seedOne`, [DATA, lexeme])

    // ASSERTIONS

    cy.visit(`/languages/${ language.id }/lexemes/${ lexeme.id }`)

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
    cy.contains(`#projects`, project.name.eng)

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
      id:   crypto.randomUUID(),
      name: { eng: `Test Project` },
    })

    const language = new Language({
      id:   crypto.randomUUID(),
      name: {},
    })

    const lexeme = new Lexeme({
      forms:    [
        {
          id:            crypto.randomUUID(),
          transcription: {},
        },
      ],
      id:           crypto.randomUUID(),
      language:     language.getReference(),
      projects: [project.getReference()],
      senses:   [
        {
          gloss: {},
          id:    crypto.randomUUID(),
        },
      ],
    })

    cy.task(`seedOne`, [METADATA, project])
    cy.task(`seedOne`, [METADATA, language])
    cy.task(`seedOne`, [DATA, lexeme])

    cy.visit(`/languages/${ language.id }/lexemes/${ lexeme.id }`)

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
      id:   crypto.randomUUID(),
      name: { eng: `Public Project` },
    })

    const privateProject = new Project({
      id:          crypto.randomUUID(),
      name:        { eng: `Private Project` },
      permissions: new Permissions({ public: false }),
    })

    const userProject = new Project({
      id:          crypto.randomUUID(),
      name:        { eng: `User Project` },
      permissions: new Permissions({
        admins: [msAuthUser],
      }),
    })

    const language = new Language({
      id: crypto.randomUUID(),
    })

    const lexeme = new Lexeme({
      id:       crypto.randomUUID(),
      language: language.getReference(),
      projects: [
        publicProject.getReference(),
        privateProject.getReference(),
        userProject.getReference(),
      ],
    })

    cy.task(`seedOne`, [METADATA, publicProject])
    cy.task(`seedOne`, [METADATA, privateProject])
    cy.task(`seedOne`, [METADATA, userProject])
    cy.task(`seedOne`, [METADATA, language])
    cy.task(`seedOne`, [DATA, lexeme])

    cy.visit(`/languages/${ language.id }/lexemes/${ lexeme.id }`)
    cy.get(`#metadata-link`).click()

    // ASSERT

    cy.get(`#projects`).children()
    .should(`have.length`, 2)

  })

})
