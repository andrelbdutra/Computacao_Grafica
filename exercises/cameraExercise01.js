import * as THREE from  'three';
import KeyboardState from '../libs/util/KeyboardState.js'
import {TeapotGeometry} from '../build/jsm/geometries/TeapotGeometry.js';
import {initRenderer, 
        initDefaultSpotlight,
        createGroundPlaneXZ,
        SecondaryBox, 
        onWindowResize} from "../libs/util/util.js";
import { BoxHelper } from '../build/three.module.js';

let scene, renderer, light, camera, keyboard;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
light = initDefaultSpotlight(scene, new THREE.Vector3(5.0, 5.0, 5.0)); // Use default light    
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
keyboard = new KeyboardState();

var groundPlane = createGroundPlaneXZ(10, 10, 40, 40); // width, height, resolutionW, resolutionH
scene.add(groundPlane);

// Create objects
var cor = Math.random() * 0xffffff;
var geometry = new TeapotGeometry(0.5);
   var material = new THREE.MeshPhongMaterial({cor, shininess:"200"});
   material.side = THREE.DoubleSide;
var pote1 = new THREE.Mesh(geometry, material);
var pote2 = new THREE.Mesh(geometry, material);
var pote3 = new THREE.Mesh(geometry, material);
createTeapot( 2.0,  0.4,  0.0, Math.random() * 0xffffff, pote1);
createTeapot(0.0,  0.4,  2.0, Math.random() * 0xffffff, pote2);  
createTeapot(0.0,  0.4, -2.0, Math.random() * 0xffffff, pote3);    


let camPos  = new THREE.Vector3(3, 4, 8);
let camUp   = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0.0, 0.0, 0.0);
let aspect = window.innerWidth / window.innerHeight;
let d = 6;
var message = new SecondaryBox("");

// Main camera
camera = new THREE.OrthographicCamera(-d * aspect, d* aspect, d, -d, 0.1, 1000);
camera.position.copy(camPos);
camera.up.copy( camUp );
camera.lookAt(camLook);

const cameraHelper = new THREE.CameraHelper(camera);
scene.add(cameraHelper);
render();

function updateCamera()
{
   // DICA: Atualize a câmera aqui!
   camera.position.copy(camPos); 
   camera.up.copy(camUp);
   camera.lookAt(camLook); 

   //var cwd = new THREE.Vector3();    
  //camera.getWorldPosition(cwd);
  //camera.position.copy(cwd);
  //camera.setRotationFromQuaternion(camera.quaternion); // Get camera rotation

  cameraHelper.update();  

   message.changeMessage("Pos: {" + camPos.x + ", " + camPos.y + ", " + camPos.z + "} " + 
                         "/ LookAt: {" + camLook.x + ", " + camLook.y + ", " + camLook.z + "}");
}

function keyboardUpdate() {

   keyboard.update();
   
   // DICA: Insira aqui seu código para mover a câmera
   if ( keyboard.down("left") || keyboard.up("left")){
      camPos.x -= 1;
      camLook.x -= 1;
      pote1.translateX(-1);
   }

	if ( keyboard.down("right") )  {
      camPos.x +=  1;
      camLook.x += 1;
      pote1.translateX(1);
   }
   if ( keyboard.down("pageup") ){
      camPos.y += 1;
      camLook.y += 1;
      pote1.translateY(1);
   }
	if ( keyboard.down("pagedown") )  {
      camPos.y -=  1;
      camLook.y -= 1;
      pote1.translateY(-1);
   }
   if ( keyboard.down("up") ){
      camPos.z -= 1;
      camLook.z -= 1;
      pote1.translateZ(-1);
   }
	if ( keyboard.down("down") )  {
      camPos.z += 1;
      camLook.z += 1;
      pote1.translateZ(1);
   }
   updateCamera();
}

function createTeapot(x, y, z, color, obj)
{
      obj.castShadow = true;
      obj.position.set(x, y, z);
      //cria uma box em cada objeto para ajudar na visualização
      const box = new THREE.BoxHelper( obj, 0xffff00 );
      scene.add(box);
   scene.add(obj);
}

function render()
{
   requestAnimationFrame(render);
   keyboardUpdate();
   renderer.render(scene, camera) // Render scene
}