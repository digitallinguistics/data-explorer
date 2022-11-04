import { env }          from '../../config/app.js'
import { msAuthCookie } from '../../constants/index.js'

describe(`Error Page`, function() {

  const privateLanguageID = `cc4978f6-13a9-4735-94c5-10e4e8030437`

  it(`401: Unauthenticated`, function() {
    cy.visit(`/languages/${ privateLanguageID }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthenticated`)
    cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
    cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this item.`)
  })

  it(`403: Unauthorized`, function() {
    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
    cy.visit(`/languages/${ privateLanguageID }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthorized`)
    cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
    cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this item.`)
  })

  it(`404: Page Not Found`, function() {
    cy.visit(`/unknown`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Page Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Page Not Found`)
    cy.get(`.error-message`).should(`have.text`, `This page does not exist.`)
  })

  it(`404: Item Not Found`, function() {
    cy.visit(`/languages/bad-id`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Item Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
    cy.get(`.error-message`).should(`have.text`, `This item does not exist.`)
  })

  it(`405: Method Not Allowed`, function() {
    cy.request({
      failOnStatusCode: false,
      method:           `POST`,
      url:              `/`,
    }).then(response => {
      expect(response.status).to.equal(405)
    })
  })

  if (env !== `production`) {

    it(`500: Server Error`, function() {
      cy.visit(`/500-test`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Server Error`)
      cy.get(`.page-title`).should(`have.text`, `500: Server Error`)
      cy.get(`.error-message`).should(`have.text`, `Please consider opening an issue on GitHub to report this error.`)
    })

  }

})
