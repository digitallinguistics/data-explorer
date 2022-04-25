import { env }  from '../../config/app.js'

describe(`500`, function() {

  if (env !== `production`) {
    it(`renders a 500 page`, function() {
      cy.visit(`/500-test`, { failOnStatusCode: false })
      cy.contains(`h1`, `500: Server Error`)
    })
  }

})