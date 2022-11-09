import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import GUI from '../libs/util/dat.gui.module.js'
import KeyboardState from '../libs/util/KeyboardState.js'
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js'
import {initRenderer, 
        initDefaultSpotlight, 
        createGroundPlane,
        SecondaryBox, 
        getMaxSize,
        onWindowResize,
        createGroundPlaneWired} from "../libs/util/util.js";
import { Vector3 } from '../build/three.module.js';

var scene = new THREE.Scene();    // Create main scene
var clock = new THREE.Clock();
var stats = new Stats();          // To show FPS information
var keyboard = new KeyboardState();
initDefaultSpotlight(scene, new THREE.Vector3(25, 15, 20)); // Use default light

var renderer = initRenderer();    // View function in util/utils
  renderer.setClearColor("rgb(30, 30, 42)");


//-------------------------------------------------------------------------------
// Quaternion
//-------------------------------------------------------------------------------
var quaternion = new THREE.Quaternion(); //cria um quaternion
quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2); // muda os eixos do quaternion

//-------------------------------------------------------------------------------
// Orthographic camera
//-------------------------------------------------------------------------------
//let camLook = new THREE.Vector3(-1.0, -1.0, -1.0);
let camPos  = new THREE.Vector3(10, 10, 10);
let camUp   = new THREE.Vector3(0, 1, 0);
var aspect = window.innerWidth / window.innerHeight;
var d = 6.7;
var message = new SecondaryBox("");
var camera = new THREE.OrthographicCamera(- d * aspect, d * aspect, d, - d, 0.1, 1000); // (left, right, top, bottom, near, far);
  //camera.lookAt(camLook);
  camera.position.set(camPos);
  camera.up.set(camUp);
  
//-------------------------------------------------------------------------------
// Camera holder
//-------------------------------------------------------------------------------
let cameraHolder = new THREE.Object3D();
cameraHolder.position.set(0,0,0);
cameraHolder.add(camera);
scene.add(cameraHolder);
camera.lookAt(cameraHolder);

// Control the appearence of first object loaded
var firstRender = false;

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

//-------------------------------------------------------------------------------
// textures
//-------------------------------------------------------------------------------
var textureLoader = new THREE.TextureLoader();
var floor  = textureLoader.load('../assets/textures/granite.jpg');

//-------------------------------------------------------------------------------
// Setting ground plane
//-------------------------------------------------------------------------------
var groundPlaneWired = createGroundPlaneWired(45.0, 45.0, 45, 45, "rgb(222,184,135)"); // (width, height, width segments, height segments, color)
  //groundPlane.rotateX(THREE.MathUtils.degToRad(-90));
  scene.add(groundPlaneWired);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 2 );
  axesHelper.visible = false;
scene.add( axesHelper );

//----------------------------------------------------------------------------
var man = null;
var playAction = true;
var time = 0;
var mixer = new Array();

// Load animated files
loadGLTFFile('../assets/objects/walkingMan.glb');

render();

function loadGLTFFile(modelName)
{
  var loader = new GLTFLoader( );
  loader.load( modelName, function ( gltf ) {
    var obj = gltf.scene;
    obj.traverse( function ( child ) {
      if ( child ) {
          child.castShadow = true;
      }
    });
    obj.traverse( function( node )
    {
      if( node.material ) node.material.side = THREE.DoubleSide;
    });

    // create the man animated object  
    man = obj;
    
    scene.add ( obj );
    cameraHolder.add(man);
    man.applyQuaternion(quaternion);

    // Create animationMixer and push it in the array of mixers
    var mixerLocal = new THREE.AnimationMixer(obj);
    mixerLocal.clipAction( gltf.animations[0] ).play();
    mixer.push(mixerLocal);
    }, onProgress, onError);
}

function onError() { };

function onProgress ( xhr, model ) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
    }
}

function updateCamera()
{
  // atualiza a câmera
  camera.position.copy(camPos); 
  camera.up.copy(camUp);
  camera.lookAt(cameraHolder.position);

  //var pos = new THREE.Vector3();
  //cameraHolder.getWorldPosition(pos); // salva a posição global do objeto na variavel 'pos'
  // message.changeMessage("Pos: {" + pos.x + ", " + pos.y + ", " + pos.z + "} " + 
  //                        "/ Quaternion: {" + quaternion.w + "} ");
}

function keyboardUpdate() {

  keyboard.update();
  playAction = false;
  // codigo para mover o personagem e a camera
  if (keyboard.pressed("down") && keyboard.pressed("right") || keyboard.pressed("S") && keyboard.pressed("D"))  {
    playAction = true;
    cameraHolder.translateZ(0.07);
    cameraHolder.translateX(0.07);
    quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),THREE.MathUtils.degToRad(45));
    man.quaternion.slerp(quaternion,0.1);
  }
  else if (keyboard.pressed("down") && keyboard.pressed("left") || keyboard.pressed("S") && keyboard.pressed("A"))  {
    playAction = true;
    cameraHolder.translateZ(0.07);
    cameraHolder.translateX(-0.07);
    quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),THREE.MathUtils.degToRad(315));
    man.quaternion.slerp(quaternion,0.1);
  }
  else if (keyboard.pressed("up") && keyboard.pressed("left") || keyboard.pressed("W") && keyboard.pressed("A"))  {
    playAction = true;
    cameraHolder.translateZ(-0.07);
    cameraHolder.translateX(-0.07);
    quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),THREE.MathUtils.degToRad(225));
    man.quaternion.slerp(quaternion,0.1);
  }
  else if (keyboard.pressed("up") && keyboard.pressed("right") || keyboard.pressed("W") && keyboard.pressed("D"))  {
    playAction = true;
    cameraHolder.translateZ(-0.07);
    cameraHolder.translateX(0.07);
    quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),THREE.MathUtils.degToRad(135));
    man.quaternion.slerp(quaternion,0.1);
  }
  else if (keyboard.pressed("left") || keyboard.pressed("A")){
     playAction = true;
     cameraHolder.translateX(-0.1);
     quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),THREE.MathUtils.degToRad(270));
     man.quaternion.slerp(quaternion,0.1);
  }
 else if (keyboard.pressed("right") || keyboard.pressed("D"))  {
    playAction = true;
    cameraHolder.translateX(0.1);
    quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),THREE.MathUtils.degToRad(90));
    man.quaternion.slerp(quaternion,0.1);
  }
  else if (keyboard.pressed("up") || keyboard.pressed("W")){
    playAction = true;
    cameraHolder.translateZ(-0.1);
    quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),THREE.MathUtils.degToRad(180));
    man.quaternion.slerp(quaternion,0.1);
  }
  else if (keyboard.pressed("down") || keyboard.pressed("S"))  {
    playAction = true;
    cameraHolder.translateZ(0.1);
    quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),THREE.MathUtils.degToRad(0));
    man.quaternion.slerp(quaternion,0.1);
  }
  else if (keyboard.pressed("pageup")){
    cameraHolder.translateY(0.1);
  }
  else if (keyboard.pressed("pagedown"))  {
    cameraHolder.translateY(-0.1);
  }
  if ( keyboard.down("C"))  {
    changeProjection();
  }
  updateCamera();
}

function changeProjection()
{
  // store the previous position of the camera
  var posit = new THREE.Vector3().copy(camera.position);

  if (camera instanceof THREE.PerspectiveCamera)
  {
    // OrthographicCamera( left, right, top, bottom, near, far )
    camera = new THREE.OrthographicCamera(- d * aspect, d * aspect, d, - d, 0.1, 1000);
  } else {
    // PerspectiveCamera( fov, aspect, near, far)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  }
  camera.position.copy(posit);
  camera.lookAt(cameraHolder.position);
  cameraHolder.add(camera);
}

function render()
{
  stats.update();
  var delta = clock.getDelta(); // Get the seconds passed since the time 'oldTime' was set and sets 'oldTime' to the current time.
  keyboardUpdate(); 
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  // Animation control
  if (playAction)
  {
    for(var i = 0; i<mixer.length; i++)
      mixer[i].update( delta );
  }
}