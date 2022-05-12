import yamlParser from 'js-yaml'

describe(`Languages`, function() {

  it(`has correct title`, function() {
    cy.visit(`/languages`)
    cy.title().should(`eq`, `Oxalis | Languages`)
  })

  describe(`Languages List`, function() {

    it(`when the user is not logged in, it only displays public languages`, function() {
      cy.visit(`/languages`)
      cy.get(`.languages-list`)
      .children()
      .should(`have.length`, 2)
      .then(([first, second]) => {
        expect(first).to.contain(`Chitimacha`)
        expect(second).to.contain(`Ojibwe`)
      })
    })

    it(`when the user is logged in, it displays languages that are public or that they own, edit, or view`, function() {

      const { msAuthCookie, msAuthHeader, testUser } = Cypress.env()

      cy.visit(`/languages`, {
        headers: {
          Cookie:         `${ msAuthCookie }=12345`,
          [msAuthHeader]: testUser,
        },
      })

      cy.get(`.languages-list`)
      .children()
      .should(`have.length`, 6)
      .spread((a, b, c, d, e, f) => {
        expect(a).to.have.text(`Chitimacha`)
        expect(b).to.have.text(`Menominee`)
        expect(c).to.have.text(`Meskwaki`)
        expect(d).to.have.text(`Ojibwe`)
        expect(e).to.have.text(`Plains Cree`)
        expect(f).to.have.text(`Potawatomi`)
      })

    })

    it(`clicking a language loads the Language page`, function() {

      const ojibweID = `bc93d0ad-5afb-462b-b68c-13913124fd3e`

      cy.visit(`/languages`)
      cy.contains(`li`, `Ojibwe`)
      .click()

      cy.url()
      .should(`eq`, `http://localhost:3001/languages/${ ojibweID }`)

    })

  })

  describe(`Language Details`, function() {

    before(function() {
      cy.readFile(`data/languages.yml`)
      .then(yaml => yamlParser.load(yaml))
      .as(`languages`)
      .then(languages => languages.find(lang => lang.name.eng === `Chitimacha`))
      .as(`data`)
    })

    it(`renders data correctly`, function() {

      const {
        abbreviation,
        autonym,
        dateCreated,
        dateModified,
        description: { html },
        glottocode,
        id,
        iso,
        name,
        notes,
      } = this.data

      cy.visit(`/languages/${ id }`)

      // shows Chitimacha as the selected language in the Languages List
      cy.contains(`.languages-list li`, `Chitimacha`)
      .should(`have.class`, `current`)

      // Scientific Name
      cy.get(`.language-details .names .mls`)
      .children()
      .filter(`dd`)
      .then(([eng, ctm, fra]) => {
        expect(eng).to.contain(name.eng)
        expect(ctm).contain(name.ctm)
        expect(fra).to.contain(name.fra)
      })

      // Autonym
      cy.get(`.language-details .names .txn`)
      .children()
      .filter(`dd`)
      .then(([mod, swd, ipa]) => {
        expect(mod).to.contain(autonym.mod)
        expect(swd).contain(autonym.swd)
        expect(ipa).to.contain(autonym.ipa)
      })

      // Codes
      cy.get(`.language-details .codes .def-list`)
      .children()
      .filter(`dd`)
      .then(([glottocodeEl, isoEl, abbrEl]) => {
        expect(glottocodeEl).to.contain(glottocode)
        expect(isoEl).to.contain(iso)
        expect(abbrEl).to.contain(abbreviation)
      })

      // Description
      cy.get(`.language-details .md`)
      .then(([div]) => {
        expect(div.innerHTML.trim()).to.equal(html.trim())
      })

      // Notes
      cy.get(`.language-details .notes__notes-container`)
      .children()
      .then(([a, b]) => {

        const [noteDataA, noteDataB] = notes

        expect(a).to.contain(noteDataA.text)
        expect(a).to.contain(noteDataA.source)
        expect(b).to.contain(noteDataB.text)
        expect(b).to.contain(noteDataB.source)

      })

      // Metadata
      cy.get(`.language-details .metadata .def-list`)
      .children()
      .filter(`dd`)
      .then(([dateCreatedEl, dateModifiedEl]) => {
        expect(dateCreatedEl.textContent).to.equal(new Date(dateCreated).toLocaleDateString(`en-CA`))
        expect(dateModifiedEl.textContent).to.equal(new Date(dateModified).toLocaleDateString(`en-CA`))
      })

    })

  })

})
