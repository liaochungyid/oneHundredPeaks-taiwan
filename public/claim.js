// node elements
const claimCardsHeaderFirst = document.querySelector('#claim-cards-header-first')
const claimCardsHeaderSecond = document.querySelector('#claim-cards-header-second')
const claimCardsHeaderThird = document.querySelector('#claim-cards-header-third')
const claimCardsCollapse = document.querySelector('p.collapse')
const claimCardsContentFirst = document.querySelector('#claim-cards-content-first')
const claimCardsContentSecond = document.querySelector('#claim-cards-content-second')
const claimCardsContentThird = document.querySelector('#claim-cards-content-third')

// event listener for clicking to swap content
;[claimCardsHeaderFirst,
  claimCardsHeaderSecond,
  claimCardsHeaderThird,
  claimCardsCollapse].forEach((node) => {
  node.addEventListener('click', function onClaimCardsClick(event){
    let target = event.target

    // remove all -content- 'active' class
    ;[claimCardsContentFirst,
      claimCardsContentSecond,
      claimCardsContentThird].forEach(elem => {
      elem.classList.remove('active')
    })

    // remove add -header- 'opacity' class
    ;[claimCardsHeaderFirst,
    claimCardsHeaderSecond,
    claimCardsHeaderThird].forEach(elem => {
      elem.classList.remove('opacity50')
    })

    // check if it is not collapse all button, then open the specific content
    if (!target.classList.contains('collapse')) {
      // get the tag:a id
      if (!target.id) {
        target = target.parentElement
      }

      // add target opacity50 class
      target.classList.add('opacity50')

      // replace -head- to -content- for query selector
      const id = '#' + target.id.replace('header','content')
      console.log(id)
      console.log(document.querySelector(id))
      document.querySelector(id).classList.add('active')
    }

  })
})
