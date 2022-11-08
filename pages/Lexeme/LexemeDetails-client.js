function setCurrentTab(hash) {

  const links = document.querySelectorAll(`.tabs a`)

  for (const link of links) {
    link.removeAttribute(`aria-selected`)
  }

  const link = document.querySelector(`[href="${ hash }"]`)

  link.setAttribute(`aria-selected`, true)

  const panels = document.querySelectorAll(`.panel`)

  for (const panel of panels) {
    panel.classList.remove(`current`)
  }

  const panel = document.querySelector(hash)

  panel.classList.add(`current`)

}

const tablist = document.querySelector(`.tabs`)

tablist.addEventListener(`click`, ev => {

  const li = ev.target.closest(`li`)
  const a  = li.firstChild

  setCurrentTab(a.hash)

})

if (location.hash) setCurrentTab(location.hash)
