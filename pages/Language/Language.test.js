import { msAuthCookie } from '../../constants/index.js'
import yamlParser       from 'js-yaml'

describe(`Language Page`, function() {

  const chitiLanguageID   = `cc4978f6-13a9-4735-94c5-10e4e8030437`
  const privateLanguageID = `0a25188c-158b-4daf-bd17-5c4cdd6bd40b`

  before(function() {
    cy.readFile(`data/languages.yml`)
    .then(yaml => yamlParser.load(yaml))
    .as(`languages`)
    .then(languages => languages.find(lang => lang.id === chitiLanguageID))
    .as(`data`)
  })

  it(`displays an error message for nonexistent languages`, function() {
    cy.visit(`/languages/bad-id`)
    cy.contains(`this language does not exist`)
  })

  it(`displays an error message when unauthenticated users try to access a private language`, function() {
    cy.visit(`/languages/${ privateLanguageID }`)
    cy.contains(`you are not logged in`)
  })

  it(`displays an error message when unauthorized users try to access a private language`, function() {
    cy.visit(`/languages/${ privateLanguageID }`)
    cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
    cy.visit(`/languages/${ privateLanguageID }`)
    cy.contains(`you do not have permission`)
  })

  it.only(`displays the language details`, function() {

    const { data } = this

    cy.visit(`/languages/${ chitiLanguageID }`)
    cy.title().should(`equal`, `Oxalis | ${ data.name.eng }`)

    // Page Title
    cy.get(`.page-title`).should(`have.text`, data.name.eng)

    // Scientific Name
    cy.get(`.names .mls`)
    .children()
    .filter(`dd`)
    .then(([eng, ctm, fra]) => {
      expect(eng).to.contain(data.name.eng)
      expect(ctm).contain(data.name.ctm)
      expect(fra).to.contain(data.name.fra)
    })

    // Autonym
    cy.get(`.names .txn`)
    .children()
    .filter(`dd`)
    .then(([mod, swd, ipa]) => {
      expect(mod).to.contain(data.autonym.mod)
      expect(swd).contain(data.autonym.swd)
      expect(ipa).to.contain(data.autonym.ipa)
    })

    // Metadata
    cy.get(`.metadata`)
    .children()
    .filter(`dd`)
    .then(([dateCreatedEl, dateModifiedEl]) => {
      expect(dateCreatedEl.textContent).to.equal(new Date(data.dateCreated).toLocaleDateString(`en-CA`))
      expect(dateModifiedEl.textContent).to.equal(new Date(data.dateModified).toLocaleDateString(`en-CA`))
    })

  })

})
