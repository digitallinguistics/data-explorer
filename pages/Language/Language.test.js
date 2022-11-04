import yamlParser from 'js-yaml'

describe(`Language Page`, function() {

  const publicLanguageID = `850f3bd9-2a57-4289-bc57-05640b5d8d7d`

  before(function() {
    cy.readFile(`data/languages.yml`)
    .then(yaml => yamlParser.load(yaml))
    .as(`languages`)
    .then(languages => languages.find(lang => lang.id === publicLanguageID))
    .as(`data`)
  })

  it.only(`displays the language details`, function() {

    const { data } = this

    cy.visit(`/languages/${ publicLanguageID }`)
    cy.title().should(`equal`, `Oxalis | ${ data.name.eng }`)

    // Page Title
    cy.get(`.page-title`).should(`have.text`, data.name.eng)

    // Scientific Name
    cy.get(`.names .mls`)
    .children()
    .filter(`dd`)
    .then(([eng]) => {
      expect(eng).to.contain(data.name.eng)
    })

    // Autonym
    cy.get(`.names .mot`)
    .children()
    .filter(`dd`)
    .then(([SRO, syl]) => {
      expect(SRO).to.contain(data.autonym.SRO)
      expect(syl).contain(data.autonym.syl)
    })

    // Language Codes
    cy.get(`.codes dd`)
    .then(([glottocodeEl, isoEl, abbreviationEl]) => {
      expect(glottocodeEl.textContent).to.include(data.glottocode)
      expect(isoEl.textContent).to.include(data.iso)
      expect(abbreviationEl.textContent).to.include(data.abbreviation)
    })

    // Description
    cy.get(`.description`)
    .should(`include.text`, `Plains Cree`)

    // Metadata
    cy.get(`.metadata`)
    .children()
    .filter(`output`)
    .then(([urlEl, dateCreatedEl, dateModifiedEl]) => {
      expect(urlEl.textContent).to.equal(`https://data.digitallinguistics.io/languages/${ publicLanguageID }`)
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
