function setCurrentTab(ev) {

  const links = document.querySelectorAll(`.tabs a`)

  for (const link of links) {
    link.removeAttribute(`aria-selected`)
  }

  const li = ev.target.closest(`li`)
  const a  = li.firstChild

  a.setAttribute(`aria-selected`, true)

  const panels = document.querySelectorAll(`.panel`)

  // Use of the .current class is necessary
  // to allow the Form section to be displayed by default
  for (const panel of panels) {
    panel.classList.remove(`current`)
  }

  const panel = document.querySelector(a.hash)

  panel.focus()

}

const tablist = document.querySelector(`.tabs`)

tablist.addEventListener(`click`, setCurrentTab)
