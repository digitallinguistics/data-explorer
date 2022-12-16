const button = document.querySelector(`.js-main-nav__button`)
const ul     = document.querySelector(`.js-main-nav__ul`)

function hideNav() {
  ul.classList.add(`hidden`)
}

function toggleNav() {
  if (ul.classList.contains(`hidden`)) ul.classList.remove(`hidden`)
  else ul.classList.add(`hidden`)
}

button.addEventListener(`click`, toggleNav)
window.addEventListener(`load`, hideNav) // this way the nav is only hidden if JS is working
window.addEventListener(`resize`, hideNav)
