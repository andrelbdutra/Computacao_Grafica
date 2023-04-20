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

function createCylinder(cor, tam = 1)
{
  var cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, tam, 25);
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

function createAFD(estados, pai, idFilho){
    if(i > estados){
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
            createAFD(i + 1, objs[i], idFilho)
        }
        idFilho++;
    }
}
//createAFD(data.estados.length - 1, null)


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


function outroTestekkkkk(){


    //var nodes = []
    
    // Data
    const estados = '1 2 3 4'.split(' ')
    function createObj(){
        const geometry = new THREE.SphereGeometry(0.25, 64, 64)
        const material = new THREE.MeshPhongMaterial({
        color: "yellow"
    })
        return new THREE.Mesh(geometry, material)
    }
    
    
    const arestas = [
        ['1', {'a':3}],['1', {'b':2}],
        ['2', {'a':3}],['2', {'b':4}],
        ['3', {'a':4}],['3', {'b':2}],
        ['4', {'a':4}],['4', {'b':4}],
    ]
    
    function addAresta(origin, destination){
        let originNo = nos[origin-1]
        let destinationNo = nos[destination-1]
    
        //instancia a junta e a aresta
        originNo.joints.push(createJoint('blue'))
        originNo.cylinders.push(createCylinder('blue'))
        originNo.sai++;
        // posiciona aresta
        originNo.obj.add(originNo.joints[originNo.joints.length - 1])
        originNo.joints[originNo.sai - 1].add(originNo.cylinders[originNo.sai - 1])
        originNo.joints[originNo.sai - 1].matrixAutoUpdate = false;
        originNo.cylinders[originNo.sai - 1].matrixAutoUpdate = false;
        originNo.joints[originNo.sai - 1].matrix.identity();
        originNo.cylinders[originNo.sai - 1].matrix.identity();
        originNo.joints[originNo.sai - 1].matrix.multiply(Mat4.makeRotationY(-Math.PI/180 * 180/originNo.sai));
        originNo.cylinders[originNo.sai - 1].matrix.multiply(Mat4.makeRotationZ(-Math.PI/2));
        originNo.cylinders[originNo.sai - 1].matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));
    
        // adiciona nó destino ao cylindro
        if(destinationNo.active == false){
            console.log("Adiciona nó destino")
            //scene.add(destinationNo.obj)
            destinationNo.entra++;
    
            originNo.cylinders[originNo.sai - 1].add(destinationNo.obj)
            console.log(originNo.cylinders[originNo.sai - 1])
            console.log(destinationNo.obj)
            destinationNo.obj.position.set(destination-1+0.5, 0.25, 0.5)
            //destinationNo.pai == originNo.cylinders[originNo.sai - 1]
            destinationNo.active == true
            // Corrige posição
            // destinationNo.obj.matrixAutoUpdate = false;
            // destinationNo.obj.matrix.identity();
            // destinationNo.obj.matrix.multiply(Mat4.makeRotationZ(angle[1])); 
            // destinationNo.obj.matrix.multiply(Mat4.makeTranslation(0.0, 0.5, 0.0));
        }
        else{
            destinationNo.pai.remove(destinationNo.obj)
            originNo.cylinders[originNo.sai - 1].add(destinationNo.obj)
            destinationNo.pai == originNo.cylinders[originNo.sai - 1]
        }
    
    }
    
    // Graph
    const adjacencyList = new Map();
    
    // Add node
    function addNode(estado){
        let i = estado - 1
        adjacencyList.set(estado, [])
        // objs.push(createCylinder)
        // //nodes[parseInt(estado) - 1]
        // scene.add(objs[parseInt(estado) - 1])
        nos.push({
            obj: new THREE.Mesh(geometry, material),
            active: false,
            cylinders: [],
            joints: [],
            pai: null,
            sai: 0,
            entra: 0,
        })
        nos[i].obj.position.set(i+0.5, 0.25, 0.5)
        if(i == 0){
            scene.add( nos[i].obj );
            nos[i].active = true;
        }
    }
    
    // Add edges
    function addEdge(origin, destination){
        adjacencyList.get(origin).push(destination)
        addAresta(origin, destination['a'] || destination['b'])
    }
    
    // create the graph
    estados.forEach(addNode)
    arestas.forEach(aresta => addEdge(...aresta))
    
    console.log(adjacencyList)
    console.log(adjacencyList.get('1')[0]['a'])
}
//outroTestekkkkk();

function maisUmTeste(){

    let cy = 0
    let jo = 0
    
    function adjustCylinder(obj)
    {
    
      obj.matrixAutoUpdate = false;
    
      // resetting matrices
      obj.matrix.identity();
    
      // Auxiliar matrix
      var mat4 = new THREE.Matrix4();
    
      // Will execute T1 and then R1
      obj.matrix.multiply(mat4.makeRotationZ(angle[0])); // R1
      obj.matrix.multiply(mat4.makeTranslation(0.0, 0.5, 0.0)); // T1
      
      // Just need to translate the sphere to the right position
      //j2.matrix.multiply(mat4.makeTranslation(0.0, 0.5, 0.0));
        cy = cy+0.2
    }
    function adjustJoint(obj){
        obj.matrixAutoUpdate = false;
    
        // resetting matrices
        obj.matrix.identity();
      
        // Auxiliar matrix
        var mat4 = new THREE.Matrix4();
      
        // Will execute T1 and then R1
        obj.matrix.multiply(mat4.makeRotationZ(angle[1])); // R1
        obj.matrix.multiply(mat4.makeTranslation(0.0, 0.5, 0.0)); // T1
        jo = jo+0.2
    }
    
    let visitados = []
    let vertices = []
    let estados = [0, 1, 2, 3]
    estados.forEach(vertice => vertices.push(createJoint()))
    let arestas = []
    let ligado = [
        [0, 1],
        [1, 3],
        [3, 2],
        //[2, 2],
    ]
    
    for(let i = 0; i < ligado.length; i++){
        let origem = ligado[i][0]
        let destino = ligado[i][1]
        if(i == 0){
            createArestaRaiz(origem, destino)
        }
        else
            createAresta(origem, destino, i)
    
    }
    
    function createAresta(origem, destino, i) {
        visitados.push(destino)
        vertices[origem].translateY(0.25+i)
        //scene.add(vertices[origem])
        arestas.push(createCylinder('green'))
        vertices[origem].add(arestas[i])
        adjustCylinder(arestas[i])
        arestas[i].add(vertices[destino])
        adjustJoint(vertices[destino])
    }
    function createArestaRaiz(origem, destino) {
        visitados.push(origem)
        visitados.push(destino)
        vertices[origem].translateY(0.25)
        scene.add(vertices[origem])
        arestas.push(createCylinder('green'))
        vertices[origem].add(arestas[0])
        adjustCylinder(arestas[0])
        arestas[0].add(vertices[destino])
        adjustJoint(vertices[destino])
    }
}
//maisUmTeste()

var Nos
var Nos1
function testeDefinitivo(){ 
    // Data
    const simbolos = ['a', 'b']
    const estados = '1 2 3 4'.split(' ')
    function createObj(){
        const geometry = new THREE.SphereGeometry(0.25, 64, 64)
        const material = new THREE.MeshPhongMaterial({
        color: "yellow"
    })
        return new THREE.Mesh(geometry, material)
    }
    
    
    const arestas = [
        ['1', {'a':3}],['1', {'b':2}],
        ['2', {'a':3}],['2', {'b':4}],
        ['3', {'a':4}],['3', {'b':2}],
        ['4', {'a':4}],['4', {'b':4}],
    ]
    
    // Graph
    const adjacencyList = new Map();
    Nos = [
        {index:1,obj:null,visited:false, filhos:[3, 2], pai:null,qnt:0, x:0, z:0,arestas:[]},
        {index:2,obj:null,visited:false, filhos:[3, 4], pai:null,qnt:0, x:0, z:0,arestas:[]},
        {index:3,obj:null,visited:false, filhos:[4, 5], pai:null,qnt:0, x:0, z:0,arestas:[]},
        {index:4,obj:null,visited:false, filhos:[4, 6], pai:null,qnt:0, x:0, z:0,arestas:[]},
        {index:5,obj:null,visited:false, filhos:[2, 1], pai:null,qnt:0, x:0, z:0,arestas:[]},
        {index:6,obj:null,visited:false, filhos:[7, 6], pai:null,qnt:0, x:0, z:0,arestas:[]},
        {index:7,obj:null,visited:false, filhos:[5, 3], pai:null,qnt:0, x:0, z:0,arestas:[]},
        ]
    Nos1 = [
        {index:1,obj:null,visited:false, filhos:[3, 2], pai:null,qnt:0, x:0, z:0,arestas:[]},
        {index:2,obj:null,visited:false, filhos:[3, 4], pai:null,qnt:0, x:0, z:0,arestas:[]},
        {index:3,obj:null,visited:false, filhos:[4, 2], pai:null,qnt:0, x:0, z:0,arestas:[]},
        {index:4,obj:null,visited:false, filhos:[4, 4], pai:null,qnt:0, x:0, z:0,arestas:[]},
        ]
    
    let Arestas = []

    function colocaAresta(){
        console.log(Nos[0].obj.position.angleTo(Nos[1].obj.position))
        Nos[0].obj.position.angleTo(Nos[1].obj.position)
        Arestas.push(createCylinder("green", Nos[0].obj.position.distanceTo(Nos[1].obj.position)))
        var dir = new THREE.Vector3().subVectors(Nos[0].obj.position, Nos[1].obj.position);
        var distMax = dir.length();
        //dir.normalize();
        var distPassed = 0;
        distPassed += Nos[0].obj.position.distanceTo(Nos[1].obj.position)/100;
        Arestas[0].position.copy(Nos[1].obj.position).addScaledVector(dir, THREE.MathUtils.clamp(distPassed, 0, distMax));
        scene.add(Arestas[0])
        //Nos[0].obj.add(Arestas[0])
        //Arestas[0].matrixAutoUpdate = false;
        //Arestas[0].matrix.identity();
        //Arestas[0].matrix.multiply(Mat4.makeRotationZ(-Math.PI/2));
        //Arestas[0].matrix.multiply(Mat4.makeTranslation(0.0, Nos[0].obj.position.distanceTo(Nos[1].obj.position)/2, 0.0));
        console.log(dir)
        //Nos[0].obj.rotateX(-Math.PI/2)
        //Arestas[0].translateZ(0.25)
        //Arestas[0].position.copy(dir)

        //Arestas[0].rotateZ(        Nos[0].obj.position.angleTo(Nos[2].obj.position))

        //Arestas[0].translateY(Nos[0].obj.position.distanceTo(Nos[1].obj.position)/2)
        //scene.add(Arestas[0])
        console.log(Nos[0].obj.position.distanceTo(Nos[2].obj.position))
    }

    // Add node
    function addNode(estado){
        let i = estado
        adjacencyList.set(estado, [])
        //console.log(adjacencyList.get(i.toString())[0]['a'] || adjacencyList.get(estado)[1]['b'])
    }
    
    // Add edges
    function addEdge(origin, destination){
        adjacencyList.get(origin).push(destination)
    }
    
    function visit(no, lado){
        if(no.visited == false){
            no.visited = true
            no.obj = createJoint()
            if(no.index == 1){
                scene.add(no.obj)
                no.obj.position.set(0 ,0.25, 0)
                no.obj.rotateX(-Math.PI/2)
            }
            else{
                if(lado == 0){
                    no.obj.position.set(0 ,0.5, 0)
                    no.pai.arestas.push(createCylinder("green"))
                    scene.add(no.pai.arestas[no.pai.arestas.length - 1])
                    no.pai.obj.add(no.pai.arestas[no.pai.arestas.length - 1])
                    no.pai.arestas[no.pai.arestas.length - 1].rotateX(-Math.PI / 2*lado+1)
                    no.pai.arestas[no.pai.arestas.length - 1].translateY(0.5)
                    no.pai.arestas[no.pai.arestas.length - 1].add(no.obj)
                }
                else{
                    no.obj.position.set(0 ,0.5, 0)
                    no.pai.arestas.push(createCylinder("green"))
                    scene.add(no.pai.arestas[no.pai.arestas.length - 1])
                    no.pai.obj.add(no.pai.arestas[no.pai.arestas.length - 1])
                    no.pai.arestas[no.pai.arestas.length - 1].rotateX(-Math.PI / 2*lado+1)
                    no.pai.arestas[no.pai.arestas.length - 1].translateY(0.5)
                    no.pai.arestas[no.pai.arestas.length - 1].add(no.obj)
                }
            }
            no.filhos.forEach(filho => {Nos[filho-1].pai = no; visit(Nos[filho-1], no.qnt); no.qnt++})
            // Nos[no.filhos[0]-1].pai = no;
            // visit(Nos[no.filhos[0]], 0)
            // no.qnt++;
            // Nos[no.filhos[1]-1].pai = no;
            // visit(Nos[no.filhos[1]], 1)
            // no.qnt++;
        }
    }
    visit(Nos[0])
    //colocaAresta()
    console.log(Nos)

    // function criaNo(estado, filho, vetor){
    //     let pos = 0;
    //     if(filho == 0)
    //         pos = 1;
    //     else
    //         pos = -1
    //     Nos.push(createJoint())
    //     console.log(filho)
    //     Nos[estado].position.set(estado, 0.25, pos)
    //     scene.add(Nos[estado])
    // }

    // Nos.push(createJoint())
    // Nos[0].translateY(0.25)
    // scene.add(Nos[0])

    // // create the graph
    // estados.forEach(addNode)
    // arestas.forEach(aresta => addEdge(...aresta))
    
    // console.log(adjacencyList)
    // var vetor = [0, 0.25, 0, 0]
    // for(let i = 0; i < estados.length; i++){
    //     for(let j = 0; j < simbolos.length; j++){
    //         let iterator = i+1
    //         //console.log(j)
    //         //console.log(adjacencyList.get(iterator.toString())[j][simbolos[j]])
    //         criaNo(iterator, j, vetor)
    //     }
    //     console.log('')
    // }
    // //console.log(adjacencyList.get('1')[0]['a'])
}

function onDocumentMouseDown( event ) {
    var raycaster = new THREE.Raycaster(); // create once
    var mouse = new THREE.Vector2(); // create once
    
    //identifica a posição do mouse
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    
    raycaster.setFromCamera( mouse, camera );

    //se for pra selecionar a parede também, descomentar as 2 linhas abaixo e comentar a próxima:
    //let boxes = objects.concat(parede);
    //boxes = boxes.map(box => box.obj);

    let boxes = Nos.map(box => box);
    //let boxes = objects.map(box => box);

    var intersects = raycaster.intersectObjects(boxes);
    console.log(intersects);
        
    //intersercts cria um vetor a partir da câmera na direção do mouse e identifica os objetos nessa reta
    //no console.log(intersects) vi que ta criando um array pegando o plano também, então usamos a posição [0].
    if(intersects.length==0){
        //console.log(objectHolded);
    }
    else if(intersects.length==0) return;
    else if(isSameMaterial(intersects[0].object.material, cubeMaterial) && isHoldingBlock === false && player.bb.distanceToPoint(intersects[0].object.position) <3.5 || intersects[0].object.pressing === true && player.bb.distanceToPoint(intersects[0].object.isPressing.position)<3.5 && isSameMaterial(intersects[0].object.material, cubeMaterial) && isHoldingBlock === false) {
        intersects[0].object.material=cubeMaterialSelected;
        let auxPos = intersects[0].object.position;
        //intersects[0].object.getWorldPosition(auxPos.position);
        cameraHolder.add(intersects[0].object);
        let newPos = new THREE.Vector3(Math.round(auxPos.x-cameraHolder.position.x), cameraHolder.position.y + 0.5 , Math.round(auxPos.z-cameraHolder.position.z));
        intersects[0].object.position.copy(newPos);
        //intersects[0].object.updateBlockBB();
        isHoldingBlock = true;
        objectHolded = intersects[0].object;
    }
}
testeDefinitivo()

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
