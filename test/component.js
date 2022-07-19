// import './commands'
import { ROOT_SELECTOR, setupHooks } from 'cypress/mount-utils'

Cypress.Commands.add(`mount`, function mount(node) {

  const el = document.querySelector(ROOT_SELECTOR)

  // clean up each time we mount a new component
  el.innerHTML = ``

  // mount component
  el.append(node)

  setupHooks()

})
