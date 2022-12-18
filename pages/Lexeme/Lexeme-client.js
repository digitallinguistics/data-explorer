function setCurrentTab(hash) {

  const tabs = document.querySelectorAll(`.page-nav li`)

  for (const tab of tabs) {
    tab.removeAttribute(`aria-selected`)
  }

  const link = document.querySelector(`[href="${ hash }"]`)

  link.parentNode.setAttribute(`aria-selected`, true)

  const panels = document.querySelectorAll(`.panel`)

  for (const panel of panels) {
    panel.classList.remove(`current`)
  }

  const panel = document.querySelector(hash)

  panel.classList.add(`current`)

}

const tablist = document.querySelector(`.page-nav ul`)

tablist.addEventListener(`click`, ev => {

  const li = ev.target.closest(`li`)

  if (!li) return

  const a = li.firstChild

  setCurrentTab(a.hash)

})

if (location.hash) setCurrentTab(location.hash)
