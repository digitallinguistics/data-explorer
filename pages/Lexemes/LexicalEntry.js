const tablist = document.querySelector(`.tabs`)

function setCurrentTab(ev) {

  const links = document.querySelectorAll(`.tabs a`)

  for (const link of links) {
    link.removeAttribute(`aria-selected`)
  }

  ev.target.setAttribute(`aria-selected`, true)

}

location.hash = `form` // initialize to Form tab
tablist.addEventListener(`click`, setCurrentTab)
