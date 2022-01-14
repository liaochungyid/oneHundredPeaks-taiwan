// dependencies
import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.136.0-4Px7Kx1INqCFBN0tXUQc/mode=imports,min/optimized/three.js'
import { OrbitControls } from './../public/OrbitControls.js'

// DOM
const showcase = document.querySelector('#showcase')

// container for three.js
const sceneData = {
  ratio: showcase.getBoundingClientRect().width / showcase.getBoundingClientRect().height,
  width: showcase.getBoundingClientRect().width,
  height: showcase.getBoundingClientRect().height
}

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, sceneData.ratio, 0.1, 1000 )
camera.position.set(-30,75,75)

const renderer = new THREE.WebGLRenderer({ canvas: showcase })
renderer.setPixelRatio(sceneData.ratio)
renderer.setSize(sceneData.width, sceneData.height)

const pointLight = new THREE.PointLight(0xff0000)
pointLight.position.set(20,20,20)

const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(pointLight, ambientLight)

const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200,50)
scene.add(lightHelper,gridHelper)

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


// const geometry = new THREE.BoxGeometry( .1, .1, .1);
// const material = new THREE.MeshStandardMaterial( {color: 0x000000} );
// const cube = new THREE.Mesh( geometry, material);
// cube.position.set(0,0,0)
// scene.add(cube)

function addBlock(x,y,z) {
  const geometry = new THREE.BoxGeometry( 1, y, 1);
  const color = new THREE.Color("rgb("+(y*14)+","+(y*10 + 128)+","+(60-y*4)+")")
  const material = new THREE.MeshBasicMaterial( {color: color} );
  const cube = new THREE.Mesh( geometry, material);
  cube.position.set(x-50,y/2,z-50)
  scene.add(cube)
}

function animate() {
  window.requestAnimationFrame(animate)

  // cube.rotation.y += 100

  controls.update()

  renderer.render(scene, camera)
}

animate()