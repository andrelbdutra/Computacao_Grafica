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

let scene, renderer, camera, orbit, light;
scene = new THREE.Scene();    // Create main scene
light = initDefaultSpotlight(scene, new THREE.Vector3(2, 3, 2)); // Use default light
renderer = initRenderer();    // View function in util/utils
   renderer.setClearColor("rgb(30, 30, 42)");
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
   camera.position.set(4, 6, 5);
   camera.up.set( 0, 1, 0 );
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.
   orbit.target.set(0, 0.2, 0);
   orbit.update();   

let lightSphere = createSphere(0.1, 10, 10);
  lightSphere.position.copy(light.position);
//scene.add(lightSphere);

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

let loadingMessage = new SecondaryBox("Loading...");

var groundPlane = createGroundPlane(10, 10, 80, 80); // width and height
  groundPlane.rotateX(THREE.MathUtils.degToRad(-90));
scene.add(groundPlane);
var gridHelper = new THREE.GridHelper(10,10, "black", "black");
scene.add(gridHelper);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 3 );
  axesHelper.visible = false;
scene.add( axesHelper );

const geometry = new THREE.SphereGeometry(0.25, 64, 64)
const material = new THREE.MeshPhongMaterial({
    color: "yellow"
})

function createJoint()
{
  var sphereGeometry = new THREE.SphereGeometry(0.20, 32, 32);
  var sphereMaterial = new THREE.MeshPhongMaterial( {color:'white'} );
  var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
  return sphere;
}

function createLoop()
{
  var sphereGeometry = new THREE.SphereGeometry(0.15, 32, 32);
  var sphereMaterial = new THREE.MeshPhongMaterial( {color:'rgb(180,180,255)'} );
  var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
  return sphere;
}

function createCylinder(cor)
{
  var cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 25);
  var cylinderMaterial = new THREE.MeshPhongMaterial( {color:cor} );
  var cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
  return cylinder;
}

const res = await fetch("teste.json")
const data = await res.json();
let a = data.simbolos[0]
let nos = [];
let objs = [];
let angle = [-1.57, 0, 1];


// const j1 = createJoint()
// const j2 = createJoint()
// const c1 = createCylinder()
// const c2 = createCylinder()
// scene.add(j1)
// j1.position.set(0, 0.1, 0)
// j1.add(c1)
// c1.rotateX(-Math.PI/2)
// c1.add(j2)
// j2.add(c2)


function rotateCylinder()
{
  // More info:
  // https://threejs.org/docs/#manual/en/introduction/Matrix-transformations
  c1.matrixAutoUpdate = false;
  j2.matrixAutoUpdate = false;
  c2.matrixAutoUpdate = false;

  // resetting matrices
  c1.matrix.identity();
  j2.matrix.identity();
  c2.matrix.identity();

  // Auxiliar matrix
  var mat4 = new THREE.Matrix4();

  // Will execute T1 and then R1
  c1.matrix.multiply(mat4.makeRotationZ(angle[0])); // R1
  c1.matrix.multiply(mat4.makeTranslation(0.0, 0.5, 0.0)); // T1
  
  // Just need to translate the sphere to the right position
  j2.matrix.multiply(mat4.makeTranslation(0.0, 0.5, 0.0));

  // Will execute T2 and then R2
  c2.matrix.multiply(mat4.makeRotationZ(angle[1])); // R2
  c2.matrix.multiply(mat4.makeTranslation(0.0, 0.5, 0.0)); // T2
}

var state = 0
var Mat4 = new THREE.Matrix4();
var idFilho = 0;

function geraFilho(pai, id, estado){
    nos.push({
        obj: new THREE.Mesh(geometry, material),
        joints: [],
        cylinders: [],
        pai: pai,
        filhos: []
    });
    let thisObj = nos.length-1
    console.log(thisObj);
        // Adicionando aresta
        pai.filhos.push(nos[thisObj].obj);
        pai.obj.add(pai.joints[pai.filhos.length - 1]);
        pai.joints[id].add(pai.cylinders[pai.filhos.length - 1]);
        pai.joints[id].matrixAutoUpdate = false;
        pai.cylinders[id].matrixAutoUpdate = false;
        pai.joints[id].matrix.identity();
        pai.cylinders[id].matrix.identity();
        pai.joints[id].matrix.multiply(Mat4.makeRotationY(-Math.PI/180 * 180/pai.filhos.length));
        pai.cylinders[id].matrix.multiply(Mat4.makeRotationZ(-Math.PI/2));
        pai.cylinders[id].matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));

    pai.cylinders[id].add(nos[thisObj].obj);
    nos[thisObj].obj.matrixAutoUpdate = false;
    nos[thisObj].obj.matrix.identity();
    nos[thisObj].obj.matrix.multiply(Mat4.makeRotationZ(angle[1])); 
    nos[thisObj].obj.matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));
}

function geraRaiz(){
    nos.push({
        obj: new THREE.Mesh(geometry, material),
        joints: [],
        cylinders: [],
        pai: null,
        filhos: []
    });
    scene.add( nos[0].obj );

    nos[0].obj.translateY(0.25)
    let idFilho = 0
    for(let j = 0; j < data.simbolos.length; j++){
        let simbolo = data.simbolos[j]
        let filhoNos = {[simbolo]: data[simbolo][0]-1}
        if(simbolo != '-'){
            nos[0].joints.push(createJoint())
            nos[0].cylinders.push(createCylinder())
            geraFilho(nos[0], idFilho)
            idFilho++
        }
    }
}

function criaNo(filhos){
return {
    obj: new THREE.Mesh(geometry, material),
    joints: [],
    cylinders: [],
    pai: null,
    filhos: []
}
}

function geraAFD(){
    for(let k = 0; k < data.estados.length; k++) {
        nos.push(criaNo())
        console.log(nos[k])
        for(let j = 0; j < data.simbolos.length - 1; j++){
            let simbolo = data.simbolos[j]
            let filhoNos = {[simbolo]: data[simbolo][k]-1}
            if(simbolo != '-'){
                nos[k].filhos.push({filhoNos})   
                console.log(nos[k].filhos)
            }
        }
    }
}
//geraAFD()
//geraRaiz()

function teste(){
    nos.push({
        obj: new THREE.Mesh(geometry, material),
        joints: [],
        cylinders: [],
        pai: null,
        filhos: []
    });
    scene.add( nos[0].obj );
    nos[i].obj.translateY(0.25)
    nos[i].joints.push(createJoint())
    nos[i].cylinders.push(createCylinder())
    nos[i].joints.push(createJoint())
    nos[i].cylinders.push(createCylinder())
    console.log(nos[i].filhos.length - 1)

    // nos[i].obj.add(nos[i].joints[nos[i].filhos.length]);
    // nos[i].joints[0].add(nos[i].cylinders[0]);
    // nos[i].joints[0].matrixAutoUpdate = false;
    // nos[i].cylinders[0].matrixAutoUpdate = false;
    // nos[i].joints[0].matrix.identity();
    // nos[i].cylinders[0].matrix.identity();
    // nos[i].joints[0].matrix.multiply(Mat4.makeRotationY(-Math.PI/180 * 90/1));
    // nos[i].cylinders[0].matrix.multiply(Mat4.makeRotationZ(-Math.PI/2));
    // nos[i].cylinders[0].matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));
    i++

    // FILHO 1
    nos.push({
        obj: new THREE.Mesh(geometry, material),
        joints: [],
        cylinders: [],
        pai: objs[0],
        filhos: []
    });
        // Adicionando aresta
        nos[0].filhos.push(nos[1].obj);
        nos[0].obj.add(nos[0].joints[nos[0].filhos.length - 1]);
        nos[0].joints[0].add(nos[0].cylinders[nos[0].filhos.length - 1]);
        nos[0].joints[0].matrixAutoUpdate = false;
        nos[0].cylinders[0].matrixAutoUpdate = false;
        nos[0].joints[0].matrix.identity();
        nos[0].cylinders[0].matrix.identity();
        nos[0].joints[0].matrix.multiply(Mat4.makeRotationY(-Math.PI/180 * 90/nos[0].filhos.length));
        nos[0].cylinders[0].matrix.multiply(Mat4.makeRotationZ(-Math.PI/2));
        nos[0].cylinders[0].matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));

    nos[0].cylinders[0].add(nos[1].obj);
    nos[1].obj.matrixAutoUpdate = false;
    nos[1].obj.matrix.identity();
    nos[1].obj.matrix.multiply(Mat4.makeRotationZ(angle[1])); 
    nos[1].obj.matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));
    i++

    // FILHO 2
    nos.push({
        obj: new THREE.Mesh(geometry, material),
        joints: [],
        cylinders: [],
        pai: objs[0],
        filhos: []
    });
        // Adicionando aresta
        nos[0].filhos.push(nos[2].obj);
        nos[0].obj.add(nos[0].joints[nos[0].filhos.length - 1]);
        nos[0].joints[1].add(nos[0].cylinders[nos[0].filhos.length - 1]);
        nos[0].joints[1].matrixAutoUpdate = false;
        nos[0].cylinders[1].matrixAutoUpdate = false;
        nos[0].joints[1].matrix.identity();
        nos[0].cylinders[1].matrix.identity();
        nos[0].joints[1].matrix.multiply(Mat4.makeRotationY(-Math.PI/180 * 90/nos[0].filhos.length));
        nos[0].cylinders[1].matrix.multiply(Mat4.makeRotationZ(-Math.PI/2));
        nos[0].cylinders[1].matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));

    nos[0].cylinders[1].add(nos[2].obj);
    nos[2].obj.matrixAutoUpdate = false;
    nos[2].obj.matrix.identity();
    nos[2].obj.matrix.multiply(Mat4.makeRotationZ(angle[1])); 
    nos[2].obj.matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));
    i++
    console.log(nos[0].filhos[0] == null)
}
//teste()
function createAFD(i, estados, pai, idFilho){
    if(i = estados){
        return;
    }
    console.log("cheguei aqui 1!")
    // instancia os objetos
    if(i == 0){
        objs.push(new THREE.Mesh(geometry, material))
        objs[i].position.set(i + 0.5, 0.25, 0.5)
        console.log(objs[i])
        scene.add( objs[i] );
        nos.push({
            obj: objs[i],
            joints: [],
            cylinders: [],
            pai: pai,
            filhos: []
        })
    }
    else{
        objs.push(new THREE.Mesh(geometry, material))
        //objs[i].position.set(i + 0.5, 0.25, 0.5)
        //pai.cylinder[idFilho].add( objs[i] );
        //objs[i].matrixAutoUpdate = false;
        //objs[i].matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));
        nos.push({
            obj: objs[i],
            joints: [],
            cylinders: [],
            pai: pai,
            filhos: []
        })
    } 
    // expande o nó atual
    for(let j = 0; j < data.simbolos.length - 1; j++){
        let simbolo = data.simbolos[j]
        let filhoNos = {[simbolo]: data[simbolo][i]-1}
        if(simbolo != '-'){
            nos[i].filhos.push({filhoNos})
            
            // nos[i].joints.push(createJoint())
            // nos[i].cylinders.push(createCylinder())
            // nos[i].obj.add(nos[i].joints[nos[i].filhos.length]);
            // let qntFilhos = nos[i].filhos.length - 1;
            // console.log(qntFilhos);
            // console.log(nos[i].joints[qntFilhos])
            // console.log(nos[i].cylinders[qntFilhos])
            // nos[i].joints[qntFilhos].add(nos[i].cylinders[qntFilhos]);
            // nos[i].joints[qntFilhos].matrixAutoUpdate = false;
            // nos[i].cylinders[qntFilhos].matrixAutoUpdate = false;
            // nos[i].joints[qntFilhos].matrix.identity();
            // nos[i].cylinders[qntFilhos].matrix.identity();
            // nos[i].cylinders[qntFilhos].matrix.multiply(Mat4.makeRotationZ(angle[0])); // R1
            // nos[i].cylinders[qntFilhos].matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));

        }
    }
    // explora os filhos
    idFilho = 0
    while(nos[i].filhos != null) {
        if(nos[i].filhos[idFilho] != i){
            createAFD(i + 1, estados, objs[i], idFilho)
        }
        idFilho++;
    }
}
let iterator = 0
console.log(data.estados.length - 1)
//createAFD(iterator, data.estados.length - 1, null, null)


function testeGeraAFD(){

    for(let i = 0; i < data.estados.length; i++){
        if(i == 0){
            objs.push(new THREE.Mesh(geometry, material))
            objs[0].position.set(i+0.5, 0.25, 0.5)
            scene.add( objs[0] );
            nos.push({
                obj: objs[0],
                joints:[],
                cylinders: [],
                entra: [],
                loops:[],
                isAdded: true
            })
        }
        else {
            objs.push(new THREE.Mesh(geometry, material))
            //objs[i].position.set(i+0.5, 0.25, 0.5)
            //scene.add( objs[i] );
            nos.push({
                obj: objs[i],
                joints:[],
                cylinders: [],
                entra: [],
                loops: [],
                isAdded: false
            })
        }
    }
    const cores = ["blue", "green"]
    for(let i = 0; i < data.estados.length; i++){
        for(let j = 0; j < data.simbolos.length; j++){
            let simbolo = data.simbolos[j]
            let proxNos = {[simbolo]: data[simbolo][i]}
            if(i == (data[simbolo][j] - 1)){
                // scene.add(nos[i].obj)
                // nos[i].isAdded = true;
                nos[i].entra.push({proxNos})
                nos[i].loops.push(createLoop())
                nos[i].obj.add(nos[i].loops[nos[i].entra.length - 1])
                nos[i].loops[nos[i].entra.length - 1].matrixAutoUpdate = false;
                nos[i].loops[nos[i].entra.length - 1].matrix.identity();
                nos[i].loops[nos[i].entra.length - 1].matrix.multiply(Mat4.makeRotationZ(-Math.PI/180 * 180/nos[i].entra.length));
                nos[i].loops[nos[i].entra.length - 1].matrix.multiply(Mat4.makeTranslation(0.15, 0.15, 0.15));
            }
            else if(nos[data[simbolo][j] - 1].isAdded == false){
            nos[i].entra.push({proxNos})
                console.log(proxNos[simbolo])
                nos[i].joints.push(createJoint(cores[j]))
                nos[i].cylinders.push(createCylinder(cores[j]))
                nos[i].obj.add(nos[i].joints[nos[i].entra.length - 1])
                nos[i].joints[nos[i].entra.length - 1].add(nos[i].cylinders[nos[i].entra.length - 1])
                nos[i].joints[nos[i].entra.length - 1].matrixAutoUpdate = false;
                nos[i].cylinders[nos[i].entra.length - 1].matrixAutoUpdate = false;
                nos[i].joints[nos[i].entra.length - 1].matrix.identity();
                nos[i].cylinders[nos[i].entra.length - 1].matrix.identity();
                nos[i].joints[nos[i].entra.length - 1].matrix.multiply(Mat4.makeRotationY(-Math.PI/180 * 180/nos[i].entra.length));
                nos[i].cylinders[nos[i].entra.length - 1].matrix.multiply(Mat4.makeRotationZ(-Math.PI/2));
                nos[i].cylinders[nos[i].entra.length - 1].matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));
                nos[i].cylinders[nos[i].entra.length - 1].add(nos[data[simbolo][i] - 1].obj)
                console.log(nos[data[simbolo][i] - 1].obj)
                nos[data[simbolo][i] - 1].obj.matrixAutoUpdate = false;
                nos[data[simbolo][i] - 1].obj.matrix.identity();
                nos[data[simbolo][i] - 1].obj.matrix.multiply(Mat4.makeRotationZ(angle[1])); 
                nos[data[simbolo][i] - 1].obj.matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));
                nos[data[simbolo][i] - 1].isAdded = true;

            }
        }
    }
    
    console.log(nos[0])
    console.log(nos[1].entra)
    console.log(nos[2].entra)
    console.log(nos[3].entra)
}
//testeGeraAFD()




buildInterface();
//rotateCylinder()
render();


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
    this.laserActive = true;
    this.type = "laserFence";
    this.onChooseObject = function()
    {
      //assetManager.hideAll();
      //console.log(assetManager['laserFence'])
      assetManager[this.type].visible = true;   
    };
    this.onViewAxes = function(){
      axesHelper.visible = this.viewAxes;
    };
    this.changeLaserActive = function(){
      if(this.laserActive == false){
        assetManager[this.type].setNotVisible();
      }
      else 
      assetManager[this.type].setVisible();
    }
  };

  // GUI interface
  var gui = new GUI();
  gui.add(controls, 'type',
  //['laserFence', 'orca', 'woodenGoose', 'chair', 'L200', 'tank'])
  ['laserFence'])
     .name("Change Object")
     .onChange(function(e) { controls.onChooseObject(); });
  gui.add(controls, 'viewAxes', false)
     .name("View Axes")
     .onChange(function(e) { controls.onViewAxes() });
  gui.add(controls, 'laserActive', true)
     .name("active")
     .onChange(function(e) { controls.changeLaserActive() });
}

function render()
{
   requestAnimationFrame(render);
   renderer.render(scene, camera)
}
