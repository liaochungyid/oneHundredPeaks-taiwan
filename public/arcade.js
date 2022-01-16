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

// Bind the form
app.bindForms = function() {
  document.querySelector('form').addEventListener("submit", function(event) {

    // stop form submit
    event.preventDefault()
    const formId = this.id
    const path = this.action
    const method = this.method.toUpperCase()

    // hide error message, if there is previous error showing
    document.querySelector(`#${formId} .form-error`).style.display = 'none'

    // get inputs to be payload
    const payload = {}
    const elements = this.elements
    for (let i=0;i<elements.length;i++) {
      if (elements[i].type !== 'submit') {
        const value = elements[i].type === 'checkbox' ? elements[i].checked : elements[i].value
        payload[elements[i].name] = value
      }
    }

    // use AJAX call the API
    app.client.request(undefined, path, method, undefined, payload, function(statusCode, responsePayload){
      // show error if there is
      if (statusCode !== 200) {

        // get error from response or set to default
        const error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again'

        // set the error message
        document.querySelector(`#${formId} .form-error`).innerHTML = error

        // show the error message
        document.querySelector(`#${formId} .form-error`).style.display = 'block'

      } else {
        // if success, pass to form processor
        app.formProcessor(formId, payload, responsePayload)
      }
    })
  })
}

// form processor
app.formProcessor = function(formId, payload, responsePayload) {

  // for claim create
  if (formId === 'claim-create') {
    // @TODO show to user
    console.log(responsePayload)
  }
}

app.bindForms()