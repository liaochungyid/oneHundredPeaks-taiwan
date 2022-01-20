// dependencies
import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.136.0-4Px7Kx1INqCFBN0tXUQc/mode=imports,min/optimized/three.js'
import { OrbitControls } from './OrbitControls.js'

app.workers = function() {

  // node elements
  const claimCardsHeaderFirst = document.querySelector('#claim-cards-header-first')
  const claimCardsHeaderSecond = document.querySelector('#claim-cards-header-second')
  const claimCardsHeaderThird = document.querySelector('#claim-cards-header-third')
  const claimCardsCollapse = document.querySelector('p.collapse')
  const claimCardsContentFirst = document.querySelector('#claim-cards-content-first')
  const claimCardsContentSecond = document.querySelector('#claim-cards-content-second')
  const claimCardsContentThird = document.querySelector('#claim-cards-content-third')
  const sectionModal = document.querySelector('section.modal')
  const sectionTable = document.querySelector('section.table')

  // init action to close all section, tab, pages...
  function closeAll() {
    // remove all -content- 'active' class
    ;[claimCardsContentFirst,
      claimCardsContentSecond,
      claimCardsContentThird,
      sectionModal,
      sectionTable].forEach(elem => {
      elem.classList.remove('active')
    })

    // set time delay for animation
    setTimeout(() => { sectionModal.classList.add('d-none') }, 200)

    // remove add -header- 'opacity' class
    ;[claimCardsHeaderFirst,
    claimCardsHeaderSecond,
    claimCardsHeaderThird].forEach(elem => {
      elem.classList.remove('opacity50')
    })
  }

  // event listener for clicking to swap content
  ;[claimCardsHeaderFirst,
    claimCardsHeaderSecond,
    claimCardsHeaderThird,
    claimCardsCollapse].forEach((node) => {
    node.addEventListener('click', function onClaimCardsClick(event){
      let target = event.target

      // check if click active tag (user want close that section), if not, to open that section
      if (!target.parentElement.classList.contains('opacity50')) {
        
        closeAll()

        // check if it is not claim a peak button, then open the specific content
        // if it is claim a peak button, load and insert the content
        if (!target.classList.contains('collapse')) {
          // get the tag:a id
          if (!target.id) { target = target.parentElement }

          // add target opacity50 class
          target.classList.add('opacity50')

          // replace -head- to -content- for query selector
          const id = '#' + target.id.replace('header','content')
          document.querySelector(id).classList.add('active')

        } else {
          // remove d-none class first
          setTimeout(() => { sectionModal.classList.remove('d-none') }, 200)
          
          // active the modal with time delay (for animation)
          // and add X (close) event listener, bind the form for actions
          setTimeout(() => {
            sectionModal.classList.add('active')

            app.bindForms(document.querySelector('form#claim-create'))
            app.bindForms(document.querySelector('form#claim-modify'))
            app.bindForms(document.querySelector('form#claim-modify-delete-confirm'))
            
            document.querySelector('a.goto-claim').addEventListener('click', app.swapForm)

            document.querySelector('a.close').addEventListener('click', function(event) {
              closeAll()            
            })
          }, 500)
        }
      } else { closeAll() }

    })
  })

  // event listener for section table 
  document.querySelectorAll('section.table div.table-title h2 a').forEach(node => {
    node.addEventListener('click', () => {
      if (sectionTable.classList.contains('active')) {
        sectionTable.classList.remove('active')
      } else {
        closeAll()
        sectionTable.classList.add('active')
      }
    })
  })

  // load table data
  app.tableProcessor()

  // load background animate
  app.animate()

}


// Bind the form
app.bindForms = function(node) {
  node.addEventListener("submit", app.formSender)
}

// form sender
app.formSender = function(event) {

  // stop form submit
  event.preventDefault()
  const formId = this.id
  const path = this.action
  let method = this.method.toUpperCase()

  // hide error message, if there is previous error showing
  if(document.querySelector(`#${formId} .form-error`)){
    document.querySelector(`#${formId} .form-error`).style.display = 'none'
  }

  // hide success message  if there is previous success showing
  if(document.querySelector("#"+formId+" .form-success")){
    document.querySelector("#"+formId+" .form-success").style.display = 'none';
  }

  // get inputs to be payload
  const payload = {}
  const elements = this.elements
  for (let i=0;i<elements.length;i++) {
    if (elements[i].type !== 'submit' && elements[i].type !== 'button') {
      const value = elements[i].type === 'checkbox' ? elements[i].checked : elements[i].value

      if (elements[i].name == '_method') {
        method = value
      } else {
        payload[elements[i].name] = value
      }
    }
  }

  // If the method is DELETE, the payload should be a queryStringObject instead
  const queryStringObject = method === 'DELETE' ? payload : {}

  // use AJAX call the API
  app.client.request(undefined, path, method, queryStringObject, payload, function(statusCode, responsePayload){
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

      // reload the table
      app.tableProcessor()
    }

  })
}

// form processor
app.formProcessor = function(formId, payload, responsePayload) {
  // clean the form value
  const elements = formId === 'claim-modify-delete-confirm' ? document.querySelector('#claim-modify').elements : document.querySelector(`#${formId}`).elements
  
  for (let i=0;i<elements.length;i++) {
    if (elements[i].type !== 'submit' && elements[i].type !== 'button') {
      if (elements[i].type === 'checkbox') {
        elements[i].checked = false
      } else if (app.config.antiphishingtoken || formId === 'claim-create' || formId === 'claim-modify-delete-confirm') {
        // if there is a token, not to clean the form inputs
        elements[i].value = ''
      }
    }
  }

  // get error from response or set to default
  let success = typeof(responsePayload.Success) == 'string' ? responsePayload.Success : false

  // for claim create
  if (formId === 'claim-create') {
    // set success message if not in responsePayload
    if (!success) { success = 'Create Successfully' }

    // show to user
    setTimeout(()=>{ document.querySelector('section.table div.table-title h2 a').click() }, 1800)
  }

  // for claim modify
  if (formId === 'claim-modify') {
 
    if (!app.config.antiphishingtoken) {

      app.swapFormSession(formId, payload, responsePayload)

      // add event listener for delete button
      document.querySelector('button.delete[type="button"]').addEventListener('click', app.formConfirm)

      // kill session after one minute
      setTimeout(() => { 
        app.swapFormSession('claim-modify',undefined,undefined)
        app.config.antiphishingtoken = false
      }, 60 * 1000)
      
    } else {
      
      // set success message if not in responsePayload
      if (!success) { success = 'Modify Successfully' }

      app.swapFormSession(formId, payload, responsePayload)

      // kill the token to end session
      app.config.antiphishingtoken = false

      // show to user
      setTimeout(()=>{ document.querySelector('section.table div.table-title h2 a').click() }, 1800)

    }
  }

  if (formId === 'claim-modify-delete-confirm') {

    app.swapFormSession('claim-modify', payload, responsePayload)

    // set success message if not in responsePayload
    if (!success) { success = 'Delete Successfully' }

    // time delay to hide the confirm form
    setTimeout(() => {
      document.querySelector(`#${formId}`).classList = ''
      app.swapFormSession('claim-modify',undefined,undefined)
      app.config.antiphishingtoken = false
    }, 1800)
  }

  // set and show the success message if there is
  if (success) {
    document.querySelector(`#${formId} .form-success`).innerHTML = success
    document.querySelector(`#${formId} .form-success`).style.display = 'block'
  }

}

app.swapFormSession = function(formId, payload, responsePayload) {
  
  const address = document.querySelector('#address')
  const email = document.querySelector('#email')
  const txn = document.querySelector('#txn')
  const antiPhishingPhrase = document.querySelector('#anti-phishing-phrase')
  const form = document.querySelector(`#${formId}`)
  const formButton = document.querySelector('div.form-button.modify')

  if (!app.config.antiphishingtoken) {

    // fill in the input fields
    address.value = responsePayload.address
    address.disabled = false
    email.value = responsePayload.email
    email.disabled = false

    // disable or hidden unchangeable fields
    txn.disabled = true

    // swap the form detail
    form.method = 'PUT'
    form.action = '/api/claim'

    // change the button below
    formButton.innerHTML = `
      <input type="hidden" name="_method" value="PUT">
      <button type="submit">Modify</button>
      <button type="button" class="delete" style="color:var(--true-white);background-color:red;margin-top:10px;">Delete</button>
    `
    // set the token as session
    app.config.antiphishingtoken = responsePayload.hashedPhrase
  } else {

    // reset the input fields disable status
    address.value = ''
    address.disabled = true
    email.value = ''
    email.disabled = true
    txn.value = ''
    txn.disabled = false
    antiPhishingPhrase.value = ''

    // swap the form detail back
    form.method = 'POST'
    form.action = '/api/session'

    // change the button below
    formButton.innerHTML = `
      <button type="submit">Send</button>
    `
  }
  
}

app.swapForm = function(event) {
  const target = event.target
  const formCreate = document.querySelector('#claim-create')
  const formModify = document.querySelector('#claim-modify')
  const formTitle = document.querySelector('div.dialog-header span')

  formTitle.style.opacity = 0
  target.innerHTML = '...'
  if (target.classList.contains('modify')) {
    target.classList = 'goto-claim create'
    formCreate.classList = ''
    setTimeout(() => {
      formModify.classList = 'active'
      target.innerHTML = 'Claim a new one'
      formTitle.innerHTML = 'Verify <br /> TXN and anti-phishing phrase'
      formTitle.style.opacity = 1
    }, 300)    
  } else if (target.classList.contains('create')) {
    target.classList = 'goto-claim modify'
    formModify.classList = ''
    setTimeout(() => {
      formCreate.classList = 'active'
      target.innerHTML = 'Already claimed, want to modify'
      formTitle.innerHTML = 'Get your art'
      formTitle.style.opacity = 1
    }, 300)
  }
}

app.formConfirm = function(event) {
  const confirmForm = document.querySelector('#claim-modify-delete-confirm')

  // show the confirm form
  confirmForm.classList = 'active'

  // set hidden input for queryStringObject (transform from payload)
  document.querySelector('#claim-modify-delete-confirm input[name="txn"]').value = document.querySelector('#txn').value

  document.querySelector('#claim-modify-delete-confirm button.cancel[type="button"]').addEventListener('click', function(event){
    // hide the confirm form
    confirmForm.classList = ''
  })
}

app.tableProcessor = function() {
  app.client.request(undefined,'/api/claims','GET',{"page":1,"offset":20},undefined, function(statusCode, responsePayload){

    if (statusCode === 200) {    

      // make the claim data into a table row
      const table = document.querySelector('table#table-content');

      // clean the table
      table.innerHTML = `
        <table id="table-content">
          <tr>
            <th>TXN</th>
            <th>ADDRESS</th>
            <th>CLAIM DATE</th>
          </tr>
          <tr id="noChecksMessage">
            <td colspan="3">It's the end of List</td>
          </tr>
        </table>
      `
      
      responsePayload.forEach((claim, ind) => {
        const tr = table.insertRow(ind+1);
        const td0 = tr.insertCell(0);
        const td1 = tr.insertCell(1);
        const td2 = tr.insertCell(2);
        td0.innerHTML = claim.txn
        td1.innerHTML = claim.address
        td2.innerHTML = claim.createdAt;
      })
    } else {
      // make the error massage data into a table row
      const table = document.querySelector('table#table-content');

      // clean the table
      table.innerHTML = `
        <table id="table-content">
          <tr>
            <th>TXN</th>
            <th>ADDRESS</th>
            <th>CLAIM DATE</th>
          </tr>
          <tr id="noChecksMessage">
            <td colspan="3">${JSON.stringify(responsePayload)}</td>
          </tr>
        </table>
      `
    }
  })
}

app.animate = function() {
  // DOM
  const canvas = document.querySelector('canvas#arcade-background')

  const sceneData = {
    ratio: canvas.getBoundingClientRect().width / canvas.getBoundingClientRect().height,
    width: canvas.getBoundingClientRect().width,
    height: canvas.getBoundingClientRect().height
  }

  if (sceneData.width > sceneData.height) {
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(60, sceneData.ratio, 0.1, 1000 )
    camera.position.set(0,sceneData.height/4,500)

    const renderer = new THREE.WebGLRenderer({ canvas })
    renderer.setPixelRatio(sceneData.ratio)
    renderer.setSize(sceneData.width, sceneData.height)

    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)

    const skyWidth = sceneData.width
    let skyHeight = skyWidth * 0.66
    const sky = new THREE.Mesh(
        new THREE.PlaneGeometry(skyWidth,skyHeight),
        new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load('/public/sky.jpg')} )
      );
    scene.add(sky)

    ;(function animate() {
      window.requestAnimationFrame(animate)

      camera.rotation.y = Math.sin(Date.now() * 0.001) * Math.PI * 0.003

      renderer.render(scene, camera)
    })()
  }
}

// Call the workers processes after the window loads
window.onload = function(){ app.workers() }