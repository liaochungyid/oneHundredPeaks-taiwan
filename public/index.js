// node elements
const galleryMainImg = document.querySelector('#gallery-main-img')
const galleryPadding = document.querySelector('#gallery-padding')
const galleryPaddingOpacityList = document.querySelectorAll('.paddings .padding')
const productPaginationDotList = document.querySelectorAll('.pagination .dot')
const productCardsCardList = document.querySelectorAll('.cards .card')
const buttonLeftRight = document.querySelector('.product-list .button')

let initProductActiveIndex = 0

// event listener for clicking to swap content
galleryPadding.addEventListener('click', function onGalleryPaddingClick(event) {
  const target = event.target

  // check if click on the image
  if (target.src) {
    // remove and add specific class
    galleryPaddingOpacityList.forEach(elem => { elem.classList = 'padding opacity50' })
    target.classList = 'padding opacity90'

    // set the main part src url
    galleryMainImg.src = target.src
  }
})

buttonLeftRight.addEventListener('click', function onButtonLeftClick(event){
  const target = event.target

  // check the target
  if (target.classList.contains('product-list-button')) {

    // do some class edit for original index
    productPaginationDotList[initProductActiveIndex].classList.remove('active')
    productCardsCardList[initProductActiveIndex].classList.remove('active')

    // switch the index
    if (target.classList.contains('left')) {
      initProductActiveIndex = initProductActiveIndex - 1 < 0 ? 4 : initProductActiveIndex - 1
    } else if (target.classList.contains('right')) {
      initProductActiveIndex = initProductActiveIndex + 1 > 4 ? 0 : initProductActiveIndex + 1
    }    

    // add class to new index
    productPaginationDotList[initProductActiveIndex].classList.add('active')
    productCardsCardList[initProductActiveIndex].classList.add('active')

  }

})


// dependencies
import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.136.0-4Px7Kx1INqCFBN0tXUQc/mode=imports,min/optimized/three.js'
import { OrbitControls } from './OrbitControls.js'

// DOM
const showcase = document.querySelector('#showcase')

// container for three.js
const sceneData = {
  ratio: showcase.getBoundingClientRect().width / showcase.getBoundingClientRect().height,
  width: showcase.getBoundingClientRect().width,
  height: showcase.getBoundingClientRect().height
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(60, sceneData.ratio, 0.1, 1000 )
camera.position.set(-30,75,75)

const renderer = new THREE.WebGLRenderer({ canvas: showcase, alpha: true })
renderer.setPixelRatio(sceneData.ratio)
renderer.setSize(sceneData.width, sceneData.height)
renderer.shadowMap.enabled = true

const pointLight = new THREE.PointLight(0xffffff,1,200)
pointLight.position.set(120,10,10)
pointLight.castShadow = true

const pointLightPivot = new THREE.Object3D()
pointLightPivot.add(pointLight)
scene.add(pointLightPivot)

const ambientLight = new THREE.AmbientLight(0x003366)
scene.add(pointLightPivot, ambientLight)

// const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(150,30)
scene.add(gridHelper)

const controls = new OrbitControls( camera, renderer.domElement )
controls.autoRotate = true
controls.maxDistance = 120
controls.minDistance = 30
controls.maxPolarAngle = 1.5


app.client.request(undefined,"/public/castHeight.json","GET",undefined,undefined,function(statusCode, payload){
  if (statusCode === 200) {
    payload.forEach((arr,y) => {
      arr.forEach((z,x) => {
        if (z !== 0) { addBlock(x,Math.floor(z/2)+1,y) }
      })
    })
  } else {
    console.log('fail to load data')
  }
})    

function addBlock(x,y,z) {
  const geometry = new THREE.BoxGeometry( 1, y, 1);
  const color = new THREE.Color("rgb("+(y*20 + 21)+","+(y*11 + 128)+","+(y*6 + 76)+")")
  const material = new THREE.MeshStandardMaterial( {color: color} );
  const cube = new THREE.Mesh( geometry, material);
  cube.position.set(x-70,y/2,z-70)
  scene.add(cube)
}

function animate() {
  window.requestAnimationFrame(animate)

  pointLightPivot.rotation.z += .01

  controls.update()

  renderer.render(scene, camera)
}

animate()