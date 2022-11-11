import { msAuthCookie } from '../../constants/index.js'

describe(`Languages`, function() {

  describe(`/languages`, function() {

    it(`displays all public languages`, function() {
      cy.visit(`/languages`)
      cy.title().should(`eq`, `Oxalis | Languages`)
      cy.get(`.page-title`).should(`have.text`, `Languages | All`)
      cy.get(`.languages-table caption`).should(`have.text`, `Languages | All`)
      cy.get(`.languages-table tbody`).children().should(`have.length`, 4)
      cy.contains(`td`, `Chitimacha`).should(`not.exist`)
      cy.contains(`td`, `Swahili`).should(`not.exist`)
      cy.get(`tbody .privacy`).each(td => expect(td).to.contain(`public`))
      cy.get(`tbody .permissions`).each(td => expect(td).to.contain(`public`))
    })

    it(`displays all private languages the user has permission to access (owner@digitallinguistics.io)`, function() {

      cy.visit(`/languages`)
      cy.setCookie(msAuthCookie, `owner@digitallinguistics.io`)
      cy.visit(`/languages`)
      cy.get(`.languages-table tbody`).children().should(`have.length`, 6)

      cy.contains(`td`, `Chitimacha`).parent()
      .within(() => {
        cy.get(`.privacy`).should(`include.text`, `private`)
        cy.get(`.permissions`).should(`include.text`, `owner`)
      })

      cy.contains(`td`, `Menominee`).parent()
      .within(() => {
        cy.get(`.privacy`).should(`include.text`, `public`)
        cy.get(`.permissions`).should(`include.text`, `owner`)
      })

    })

    it(`displays all private languages the user has permission to access (editor@digitallinguistics.io)`, function() {

      cy.visit(`/languages`)
      cy.setCookie(msAuthCookie, `editor@digitallinguistics.io`)
      cy.visit(`/languages`)
      cy.get(`.languages-table tbody`).children().should(`have.length`, 4)

      cy.contains(`td`, `Menominee`).parent()
      .within(() => {
        cy.get(`.privacy`).should(`include.text`, `public`)
        cy.get(`.permissions`).should(`include.text`, `editor`)
      })

      cy.contains(`td`, `Ojibwe`).parent()
      .within(() => {
        cy.get(`.privacy`).should(`include.text`, `public`)
        cy.get(`.permissions`).should(`include.text`, `public`)
      })

    })

    it(`displays all private languages the user has permission to access (viewer@digitallinguistics.io)`, function() {

      cy.visit(`/languages`)
      cy.setCookie(msAuthCookie, `viewer@digitallinguistics.io`)
      cy.visit(`/languages`)
      cy.get(`.languages-table tbody`).children().should(`have.length`, 5)

      cy.contains(`td`, `Chitimacha`).parent()
      .within(() => {
        cy.get(`.privacy`).should(`include.text`, `private`)
        cy.get(`.permissions`).should(`include.text`, `viewer`)
      })

    })

  })

  describe(`/projects/{projectID}/languages`, function() {

    const privateProjectID = `a24157c1-000f-4771-aa47-485fb91bf24f` // Swahili

    it(`displays a 404 page for nonexistent projects`, function() {
      cy.visit(`/projects/1234/languages`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Item Not Found`)
      cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
      cy.get(`.error-message`).should(`have.text`, `No project exists with ID 1234.`)
    })

    it(`displays an Unauthenticated error for private projects`, function() {
      cy.visit(`/projects/${ privateProjectID }/languages`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Unauthenticated`)
      cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
      cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this project.`)
    })

    it(`displays an Unauthorized error for private projects`, function() {
      cy.visit(`/`)
      cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
      cy.visit(`/projects/${ privateProjectID }`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Unauthorized`)
      cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
      cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this project.`)
    })

    it(`displays all (and only all) project languages`, function() {

      const publicProjectID = `c554474c-7f39-4ede-941b-c40b8f58b059` // Nisinoon

      cy.visit(`/projects/${ publicProjectID }/languages`)
      cy.title().should(`eq`, `Oxalis | Nisinoon | Languages`)
      cy.get(`tbody`).children().should(`have.length`, 4)

    })

  })

})
