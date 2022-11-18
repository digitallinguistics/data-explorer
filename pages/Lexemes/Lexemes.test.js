import { msAuthCookie } from '../../constants/index.js'
import yamlParser       from 'js-yaml'

describe(`Lexemes Page`, function() {

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
      cy.visit(`/languages/${ publicLanguageID }/lexemes`)
      cy.title().should(`eq`, `Oxalis | Plains Cree | Lexemes`)
      cy.get(`.page-title`).should(`have.text`, `Lexemes | Plains Cree`)
      cy.get(`.lexemes-table caption`).should(`have.text`, `Lexemes | Plains Cree`)
      cy.get(`tbody`).children().should(`have.length`, 4)
      cy.contains(`.lemma`, `cīkahikan`)
      cy.contains(`.lemma`, `masinahikan`)
      cy.contains(`.lemma`, `maskwa`)
      cy.contains(`.lemma`, `kotiskāwēwatim`)
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
        cy.title().should(`eq`, `Oxalis | Nisinoon | Lexemes`)
        cy.get(`tbody`).children().should(`have.length`, lexemes.length)
        cy.contains(`.lemma`, `cīkahikan`)
        cy.contains(`.lemma`, `sūniyanikamekmahka͞esen`).should(`not.exist`)

      })

    })

  })

  describe(`/projects/:projectID/languages/:languageID/lexemes`, function() {

    const MenomineeProjectID  = `26d40299-98fb-48c8-b51f-e62397269817`  // Menominee Dictionary
    const MenomineeLanguageID = `5fc405aa-a1a3-41e5-a80d-adb9dfbaa293`  // Menominee

    it(`Not Found: Project`, function() {
      cy.visit(`/projects/1234/languages/${ publicLanguageID }/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Item Not Found`)
      cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
      cy.get(`.error-message`).should(`have.text`, `No project exists with ID 1234.`)
    })

    it(`Not Found: Language`, function() {
      cy.visit(`/projects/${ publicProjectID }/languages/1234/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Item Not Found`)
      cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
      cy.get(`.error-message`).should(`have.text`, `No language exists with ID 1234.`)
    })

    it(`Unauthenticated: Project`, function() {

      // Use the Menominee Dictionary project for this test,
      // because the project is private, but the language is public

      cy.visit(`/projects/${ MenomineeProjectID }/languages/${ MenomineeLanguageID }/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Unauthenticated`)
      cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
      cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this project.`)

    })

    it(`Unauthenticated: Language`, function() {
      cy.log(`Impossible case. If user has access to project, they have access to the language.`)
    })

    it(`Unauthorized: Project`, function() {
      cy.visit(`/`)
      cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
      cy.visit(`/projects/${ privateProjectID }/languages/${ privateLanguageID }/lexemes`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Unauthorized`)
      cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
      cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this project.`)
    })

    it(`Unauthorized: Language`, function() {
      cy.log(`Impossible case. If user has access to project, they have access to the language.`)
    })

    it(`Lexemes: Project + Language`, function() {

      // Use Nisinoon + Menominee for this test,
      // because only some Menominee lexemes are associated with the Nisinoon project,
      // and this will test that only the appropriate lexemes are shown.

      cy.readFile(`data/lexemes.yml`)
      .then(yaml => yamlParser.load(yaml))
      .then(data => {

        // Reassigning the data/lexemes parameter doesn't seem to work here.
        // Need to save to a new variable instead.
        const lexemes = data.filter(lexeme => lexeme.projects.includes(publicProjectID) && lexeme.language === MenomineeLanguageID)

        cy.visit(`/projects/${ publicProjectID }/languages/${ MenomineeLanguageID }/lexemes`)
        cy.title().should(`eq`, `Oxalis | Nisinoon | Menominee | Lexemes`)
        cy.get(`tbody`).children().should(`have.length`, lexemes.length)
        cy.contains(`.lemma`, `sūniyanikamek`)
        cy.contains(`.lemma`, `wāqnenekan`)
        cy.contains(`.lemma`, `sūniyanikamekmahka͞esen`).should(`not.exist`)

      })

    })

  })

})
