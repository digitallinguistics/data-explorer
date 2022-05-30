const tablist = document.querySelector(`.tabs`)

function setCurrentTab(ev) {

  const links = document.querySelectorAll(`.tabs a`)

  for (const link of links) {
    link.removeAttribute(`aria-selected`)
  }

  const li = ev.target.closest(`li`)
  const a  = li.firstChild

  a.setAttribute(`aria-selected`, true)

}

if (tablist) {
  location.hash = `form` // initialize to Form tab
  tablist.addEventListener(`click`, setCurrentTab)
}
