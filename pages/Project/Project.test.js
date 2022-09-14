import { msAuthCookie } from '../../constants/index.js'

describe(`Project Page`, function() {

  const privateProjectID = `198c9710-451c-413b-abf5-b3daa4c15156`
  const publicProjectID  = `6a0fcc10-859c-4af1-8105-156ccfd95310`

  it(`displays an error message for nonexistent projects`, function() {
    cy.visit(`/projects/bad-id`)
    cy.contains(`this project does not exist`)
  })

  it(`displays an error message when unauthenticated users try to access a private project`, function() {
    cy.visit(`/projects/${ privateProjectID }`)
    cy.contains(`you are not logged in`)
  })

  it(`displays an error message when unauthorized users try to access a private project`, function() {
    cy.visit(`/projects/${ privateProjectID }`)
    cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
    cy.visit(`/projects/${ privateProjectID }`)
    cy.contains(`you do not have permission`)
  })

  it.only(`displays the project details`, function() {
    cy.visit(`/projects/${ publicProjectID }`)
  })

})
