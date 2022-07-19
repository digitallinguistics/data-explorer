const component = document.createElement(`p`)

component.innerText = `This is a component.`

describe(`Cypress`, function() {
  it(`mounts`, function() {
    cy.mount(component)
  })
})
