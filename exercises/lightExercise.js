import * as THREE from  'three';
import GUI from '../libs/util/dat.gui.module.js'
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        setDefaultMaterial,
        initDefaultBasicLight,        
        onWindowResize, 
        createLightSphere} from "../libs/util/util.js";
import {loadLightPostScene} from "../libs/util/utilScenes.js";

let scene, renderer, camera, orbit;
scene = new THREE.Scene();    // Create main scene

// cria o renderer
renderer = new THREE.WebGLRenderer();    // View function in util/utils
  renderer.shadowMap.enabled = true;
  renderer.shadowMapsoft = true;
  // VSM/PCF/PCFSoft
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
  //renderer.setPixelRatio(window.innerWidth/window.innerHeight); 
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("webgl-output").appendChild(renderer.domElement);
  renderer.setClearColor("rgb(30, 30, 42)");
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
   camera.lookAt(0, 0, 0);
   camera.position.set(5, 5, 5);
   camera.up.set( 0, 1, 0 );
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, true );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 3 );
  axesHelper.visible = false;
scene.add( axesHelper );

let dirPosition = new THREE.Vector3(20, 20, 40)
const dirLight = new THREE.DirectionalLight('white', 0.1);
dirLight.position.copy(dirPosition);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 512;
  dirLight.shadow.mapSize.height = 512;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 100;
  dirLight.shadow.camera.left = -5;
  dirLight.shadow.camera.right = 5;
  dirLight.shadow.camera.bottom = -5;
  dirLight.shadow.camera.top = 5;
let dirLightHelper = new THREE.DirectionalLightHelper(dirLight);
scene.add(dirLight);  
scene.add(dirLightHelper);

// Load default scene
loadLightPostScene(scene)

// Luzes e sombras
let ambientLight = new THREE.AmbientLight('white', 0.1);
scene.add(ambientLight);

let spotlight = new THREE.SpotLight('white', 1, 10, 0.8, 0.3, 0.1);
spotlight.castShadow = true;
spotlight.shadow.mapSize.width = 1024;
spotlight.shadow.mapSize.height = 1024;
spotlight.shadow.camera.near = 0.1;
spotlight.shadow.camera.far = 10;
spotlight.position.set(1.3, 3, 0);
spotlight.target.position.set(1.3, 0, 0);
let spotlightHelper = new THREE.SpotLightHelper(spotlight);
scene.add(spotlight);
scene.add(spotlightHelper);

spotlight.target.updateMatrixWorld();
spotlightHelper.update();

// Objetos
let material1 = new THREE.MeshPhongMaterial({
  shininess: "100",
  specular: "white",
  color: "red",
});

let geometry1 = new THREE.SphereGeometry(0.3, 20, 20, 64);
let material2 = new THREE.MeshLambertMaterial({
  color: "blue"
});

let geometry2 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
let material3 = new THREE.MeshPhongMaterial({
  color: "green",
  flatShading: true
});
let geometry3 = new THREE.ConeGeometry(0.2, 1, 20, 20);

// phong shading sphere
let sphere = new THREE.Mesh(geometry1, material1);
sphere.position.set(3, 0.3, 0.7);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

// lambert shading cube
let cubo = new THREE.Mesh(geometry2, material2);
cubo.position.set(2, 0.25, -2);
cubo.castShadow = true;
cubo.receiveShadow = true;
scene.add(cubo);

// flat shading cone
let cone = new THREE.Mesh(geometry3, material3);
cone.position.set(2, 0.5, 2);
cone.castShadow = true;
cone.receiveShadow = true;
scene.add(cone);

//---------------------------------------------------------
// Load external objects
buildInterface();
render();

function buildInterface()
{
  // GUI interface
  let gui = new GUI();
}

function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera)
}
