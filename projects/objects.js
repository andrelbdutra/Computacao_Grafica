import * as THREE from  'three';
import GUI from '../libs/util/dat.gui.module.js'
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import {initRenderer, 
        initDefaultSpotlight,
        createGroundPlane,
        SecondaryBox,
        getMaxSize,        
        onWindowResize, 
        getFilename} from "../libs/util/util.js";
import LaserFence from '../assets/objects/laserFence/index.js';
import SpikeTrap from '../assets/objects/spikeTrap/index.js';
import CranckDoor from '../assets/objects/cranckDoor/index.js';
import { Scene } from '../build/three.module.js';

let scene, renderer, camera, orbit, light;
scene = new THREE.Scene();    // Create main scene
light = initDefaultSpotlight(scene, new THREE.Vector3(3, 4, 3)); // Use default light
renderer = initRenderer();    // View function in util/utils
   renderer.setClearColor("rgb(30, 30, 42)");
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
   camera.position.set(2.18, 1.62, 3.31);
   camera.up.set( 0, 1, 0 );
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.
   orbit.target.set(0, 0.2, 0);
   orbit.update();   

let lightSphere = createSphere(0.1, 10, 10);
  lightSphere.position.copy(light.position);
scene.add(lightSphere);

scene.environment = new THREE.PMREMGenerator(renderer)


// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

let loadingMessage = new SecondaryBox("Loading...");

var groundPlane = createGroundPlane(6.0, 6.0, 80, 80); // width and height
  groundPlane.rotateX(THREE.MathUtils.degToRad(-90));
scene.add(groundPlane);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 3 );
  axesHelper.visible = false;
scene.add( axesHelper );

//---------------------------------------------------------
// Load external objects

// Assets manager --------------------------------
let assetManager = {
   // Properties ---------------------------------
   spikeTrap: null,
   laserFence: null,
   cranckDoor: null,
   plane: null,
   L200: null,
   tank: null,
   orca: null,
   woodenGoose: null,
   chair: null,
   allLoaded: false,

   // Functions ----------------------------------
   checkLoaded : function() {
    // retirar
    loadingMessage.hide(); 
      if(!this.allLoaded)
      {
         if(this.L200 && this.chair && this.orca &&
            this.plane && this.tank && this.woodenGoose){
             this.allLoaded = true;
             loadingMessage.hide(); 
         }
      }
   },   

   hideAll : function() {
      this.spikeTrap.visible = this.laserFence.visible = this.cranckDoor.visible  = false
      
   }
}
const sceneProperties = {
  cancelExecution: false,
  phase: 0,
  executing: false
}

export function degreeToRadians(angle)
{
    return angle * (Math.PI / 180);
}

function changeLaserStateStatus(index, status)
{
    //gridMapHelper.lasers.forEach(laser => laser.state = status);
    if (status == 'blue'){
        laserFences.forEach(laser => {
            laser.setBlue()
        });
    } else if (status == 'red'){
        laserFences.forEach(laser => {
            laser.setRed()
        });
    }
}

// LASER FENCE
let setLaserStatesInterval;
let setLaserStates;
let laserState;

let laserFences = [];
let laserFence = new LaserFence();
var objLF = normalizeAndRescale(laserFence, 1);
assetManager['laserFence'] = objLF;
assetManager['laserFence'].translateY(0.500);
scene.add(assetManager['laserFence']);
laserFences.push(objLF)
laserFence.visible = false;

laserState = 0;
setLaserStates = () => {
    if(laserState == 0)
    {
        changeLaserStateStatus(0, 'blue');
    }
    else
    {
        changeLaserStateStatus(0, 'red');
    }
}

setLaserStatesInterval = setInterval(() => {
  if(sceneProperties.executing)
  {
      return;
  }

  laserState = (laserState + 1) % 2;
  setLaserStates();
},1000);


// SPIKE TRAP
let spikeTrap = new SpikeTrap;
var objLF1 = normalizeAndRescale(spikeTrap, 0.7);
assetManager['spikeTrap'] = objLF1;
scene.add(assetManager['spikeTrap']);
spikeTrap.visible = false;

let requestID
let alpha = 0.01
let alpha2 = 0.1

function activateTrap(){
  if(assetManager['spikeTrap'].spikes[4].position.y.toFixed(1) < 1.5)
  {
    alpha2 += 0.05;
    assetManager['spikeTrap'].spikes.forEach(spike => spike.position.lerp(new THREE.Vector3(spike.position.x, 1.5, spike.position.z), alpha2))
      requestID = requestAnimationFrame(activateTrap);
  }
  else
  {
    cancelAnimationFrame(requestID);
    alpha2 = 0.1
  }
}

function deactivateTrap(){
  if(assetManager['spikeTrap'].spikes[4].position.y.toFixed(1) > -1.6)
  {
    alpha += 0.001;
    alpha2 += 0.01;
    assetManager['spikeTrap'].spikes.forEach(spike => spike.position.lerp(new THREE.Vector3(spike.position.x, -1.6, spike.position.z), alpha2))
    
    //assetManager['spikeTrap'].spikes[0].position.lerp(new THREE.Vector3(0, -1.5, 0), alpha)
    requestID = requestAnimationFrame(deactivateTrap);
  }
  else
  {
    cancelAnimationFrame(requestID);
    alpha = 0.01
    alpha2 = 0.1
  }
}

// CRANCK DOOR
let cranckDoor = new CranckDoor();
var objLF2 = normalizeAndRescale(cranckDoor, 1);
assetManager['cranckDoor'] = objLF2;
assetManager['cranckDoor'].translateY(0.500);
scene.add(assetManager['cranckDoor']);
//cranckDoor.visible = false;

let requestID2;
function turnCranck(mode){
  let angleRotated = 0;
    let totalRotation = 1500;
    cancelAnimationFrame(requestID2);
    function rotate()
    {
        if(angleRotated < totalRotation)
        {
            if(mode == 0)
            {
              assetManager['cranckDoor'].rotateCranckZ(degreeToRadians(-5));
              assetManager['cranckDoor'].lerpDoor(0, -2)
              if(assetManager['cranckDoor'].getDoorY().toFixed(1) == -2){
                return;
              }
            }
            else
            {
              assetManager['cranckDoor'].rotateCranckZ(degreeToRadians(5));
              assetManager['cranckDoor'].lerpDoor(1, 0)
              if(assetManager['cranckDoor'].getDoorY().toFixed(1) == 0){
                return;
              }
            }
            angleRotated += 3;
            requestID2 = requestAnimationFrame(rotate);
        }
        else
        {
            cancelAnimationFrame(requestID2);
        }
    }

    requestID2 = requestAnimationFrame(rotate);
}


let gridHelper = new THREE.GridHelper(5,5, "black","black")
scene.add(gridHelper);


//loadOBJFile('../assets/objects/', 'plane', 3.5, 0, false);
//loadOBJFile('../assets/objects/', 'L200', 2.5, 90, false);
//loadOBJFile('../assets/objects/', 'tank', 2.0, 90, false);

//loadGLTFFile('../assets/objects/', 'orca', 4.0, 180, false);
//loadGLTFFile('../assets/objects/', 'woodenGoose', 2.0, 90, false);
//loadGLTFFile('../assets/objects/','chair', 1.5, 180, false);

buildInterface();
render();

function loadOBJFile(modelPath, modelName, desiredScale, angle, visibility)
{
  var mtlLoader = new MTLLoader( );
  mtlLoader.setPath( modelPath );
  mtlLoader.load( modelName + '.mtl', function ( materials ) {
      materials.preload();

      var objLoader = new OBJLoader( );
      objLoader.setMaterials(materials);
      objLoader.setPath(modelPath);
      objLoader.load( modelName + ".obj", function ( obj ) {
        obj.visible = visibility;
        obj.name = modelName;
        // Set 'castShadow' property for each children of the group
        obj.traverse( function (child)
        {
          child.castShadow = true;
        });

        obj.traverse( function( node )
        {
          if( node.material ) node.material.side = THREE.DoubleSide;
        });

        var obj = normalizeAndRescale(obj, desiredScale);
        var obj = fixPosition(obj);
        obj.rotateY(THREE.MathUtils.degToRad(angle));

        scene.add ( obj );
        assetManager[modelName] = obj;        
      });
  });
}

function loadGLTFFile(modelPath, modelName, desiredScale, angle, visibility)
{
   var loader = new GLTFLoader( );
   loader.load( modelPath + modelName + '.glb', function ( gltf ) {
      var obj = gltf.scene;
      obj.visible = visibility;
      obj.name = getFilename(modelName);
      obj.traverse( function ( child ) {
      if ( child ) {
         child.castShadow = true;
      }
      });
      obj.traverse( function( node )
      {
         if( node.material ) node.material.side = THREE.DoubleSide;
      });

      var obj = normalizeAndRescale(obj, desiredScale);
      var obj = fixPosition(obj);
      obj.rotateY(THREE.MathUtils.degToRad(angle));

      scene.add ( obj );
      assetManager[modelName] = obj;
   });
}

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); // Available in 'utils.js'
  obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));
  return obj;
}

function fixPosition(obj)
{
  // Fix position of the object over the ground plane
  var box = new THREE.Box3().setFromObject( obj );
  if(box.min.y > 0)
    obj.translateY(-box.min.y);
  else
    obj.translateY(-1*box.min.y);
  return obj;
}

function createSphere(radius, widthSegments, heightSegments)
{
  var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, Math.PI * 2, 0, Math.PI);
  var material = new THREE.MeshBasicMaterial({color:"rgb(255,255,50)"});
  var object = new THREE.Mesh(geometry, material);
    object.castShadow = true;
  return object;
}

function buildInterface()
{
  // Interface
  var controls = new function ()
  {
    this.viewAxes = false;
    this.activeLaser = true;
    this.type = "cranckDoor";
    this.onChooseObject = function()
    {
      assetManager.hideAll();
      console.log(assetManager[this.type])
      assetManager[this.type].visible = true;   
    };
    this.onViewAxes = function(){
      axesHelper.visible = this.viewAxes;
    };
    this.changeActive = function(){
      if(assetManager[this.type] == assetManager["laserFence"]){
        if(this.activeLaser == false){
          assetManager[this.type].setNotVisible();
        }
        else 
        assetManager[this.type].setVisible();
        }
      if(assetManager[this.type] == assetManager["spikeTrap"]){
        if(this.activeLaser == false){
          cancelAnimationFrame(requestID);
          deactivateTrap()
        }
        else{
          cancelAnimationFrame(requestID);
          activateTrap()
        }
      }
      if(assetManager[this.type] == assetManager["cranckDoor"]){
        if(this.activeLaser == false){
          cancelAnimationFrame(requestID);
          turnCranck(0)
        }
        else{
          cancelAnimationFrame(requestID);
          turnCranck(1)
        }
      }
    }
  };

  // GUI interface
  var gui = new GUI();
  gui.add(controls, 'type',
  //['laserFence', 'orca', 'woodenGoose', 'chair', 'L200', 'tank'])
  ['cranckDoor', 'spikeTrap', 'laserFence'])
     .name("Change Object")
     .onChange(function(e) { controls.onChooseObject(); });
  gui.add(controls, 'viewAxes', false)
     .name("View Axes")
     .onChange(function(e) { controls.onViewAxes() });
  gui.add(controls, 'activeLaser', false)
     .name("active")
     .onChange(function(e) { controls.changeActive() });
}

function render()
{
   assetManager.checkLoaded();
   requestAnimationFrame(render);
   renderer.render(scene, camera)
}
