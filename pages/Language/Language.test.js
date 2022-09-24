import yamlParser from 'js-yaml'

describe(`Language Page`, function() {

  const chitiLanguageID = `cc4978f6-13a9-4735-94c5-10e4e8030437`

  before(function() {
    cy.readFile(`data/languages.yml`)
    .then(yaml => yamlParser.load(yaml))
    .as(`languages`)
    .then(languages => languages.find(lang => lang.id === chitiLanguageID))
    .as(`data`)
  })

  it(`displays the language details`, function() {

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

    // Language Codes
    cy.get(`.codes dd`)
    .then(([glottocodeEl, isoEl, abbreviationEl]) => {
      expect(glottocodeEl.textContent).to.include(`chit1248`)
      expect(isoEl.textContent).to.include(`ctm`)
      expect(abbreviationEl.textContent).to.include(`chiti`)
    })

    // Description
    cy.get(`.description`)
    .should(`include.text`, `Chitimacha is a language isolate`)

    // Metadata
    cy.get(`.metadata`)
    .children()
    .filter(`output`)
    .then(([urlEl, dateCreatedEl, dateModifiedEl]) => {
      expect(urlEl.textContent).to.equal(`https://data.digitallinguistics.io/languages/${ chitiLanguageID }`)
      expect(dateCreatedEl.textContent).to.equal(new Date(data.dateCreated).toLocaleDateString(`en-CA`))
      expect(dateModifiedEl.textContent).to.equal(new Date(data.dateModified).toLocaleDateString(`en-CA`))
    })

    // Notes
    cy.get(`.notes`)
    .children()
    .then(([a, b]) => {

      const [noteDataA, noteDataB] = data.notes

      expect(a).to.contain(noteDataA.text)
      expect(a).to.contain(noteDataA.source)
      expect(b).to.contain(noteDataB.text)
      expect(b).to.contain(noteDataB.source)

    })

  })

})
