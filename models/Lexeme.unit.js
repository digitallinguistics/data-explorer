import { expect } from 'chai'
import Lexeme     from '../models/Lexeme.js'

describe(`Lexeme`, function() {

  it(`references`, function() {

    const lexeme = new Lexeme({
      bibliography: [
        { id: `97b0f828-f15b-4fbc-b310-28e2e356a341` },
        { id: `f9e0da20-7929-4d1d-8e8a-9aa07826dbe5` },
      ],
      forms: [
        {
          bibliography: [
            { id: `cc240849-ab18-49cc-b12a-8e411fe6d148` },
            { id: `d6612559-00c7-42fb-8821-aeffb456e882` },
          ],
        },
        {
          bibliography: [
            { id: `97b0f828-f15b-4fbc-b310-28e2e356a341` }, // repeat from above
            { id: `7784fc51-9f67-4903-b0d4-f5de26449f7a` },
          ],
        },
      ],
      senses: [
        {
          bibliography: [
            { id: `0715fa68-b892-40e2-94bd-fb84ef489a0e` },
            { id: `691f6d74-89af-4aa5-abcd-9fe26dff4df3` },
          ],
        },
        {
          bibliography: [
            { id: `2f887a93-c84f-4f24-adbc-5e08b109a4d4` },
            { id: `092de299-6800-42f9-97b2-d9cc0eeb2400` },
          ],
        },
      ],
    })

    const ids = lexeme.references

    expect(ids.size).to.equal(9)

  })

})
