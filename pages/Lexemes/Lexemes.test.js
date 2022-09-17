describe(`Lexemes Page`, function() {

  it(`displays the lexemes data correctly`, function() {

    const publicProjectID = `6a0fcc10-859c-4af1-8105-156ccfd95310`

    cy.visit(`/projects/${ publicProjectID }/lexemes`)
    cy.title().should(`eq`, `Oxalis | Lexemes | Public Test Project`)

  })

})
