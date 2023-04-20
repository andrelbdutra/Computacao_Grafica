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

let scene, renderer, camera, orbit, light;
scene = new THREE.Scene();    // Create main scene
//light = initDefaultSpotlight(scene, new THREE.Vector3(2, 3, 2)); // Use default light
renderer = initRenderer();    // View function in util/utils
   renderer.setClearColor("rgb(30, 30, 42)");
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
   camera.position.set(4, 6, 5);
   camera.up.set( 0, 1, 0 );
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.
   orbit.target.set(0, 0.2, 0);
   orbit.update();   

   let ambientLight = new THREE.AmbientLight('white', 1)
   scene.add(ambientLight);

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

var groundPlane = createGroundPlane(10, 10, 80, 80); // width and height
  groundPlane.rotateX(THREE.MathUtils.degToRad(-90));
//scene.add(groundPlane);
var gridHelper = new THREE.GridHelper(10,10, "black", "black");
//scene.add(gridHelper);


const geometry = new THREE.SphereGeometry(0.15, 64, 64)
const material = new THREE.MeshPhongMaterial({
    color: "yellow",
    transparent: true,
    opacity: 0.5
})

function createLoop()
{
  var sphereGeometry = new THREE.SphereGeometry(0.15, 32, 32);
  var sphereMaterial = new THREE.MeshPhongMaterial( {color:'rgb(180,180,255)'} );
  var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
  return sphere;
}

const res = await fetch("teste2.json")
const data = await res.json();
let a = data.nodes
console.log(data);

/////////////////////////////////////////////////////////////////////////////////////
class Line extends THREE.Line{
    constructor(geometry, material){
        super(geometry, material)
    }
}

function fibonacciSphere(numPoints, point) {
    const rnd = 1;
    const offset = 2 / numPoints;
    const increment = Math.PI * (3 - Math.sqrt(5));
  
    const y = ((point * offset) - 1) + (offset / 2);
    const r = Math.sqrt(1 - Math.pow(y, 2));
  
    const phi = (point + rnd) % numPoints * increment;
  
    const x = Math.cos(phi) * r;
    const z = Math.sin(phi) * r;
  
    return new THREE.Vector3(x*2, y*2, z*2);
  }


//var numElements = 9
var numElements = 32
var actualElement = 0
class Node extends THREE.Mesh{
    constructor(geometry, material, dept, position) {
        super(geometry, material)
        this.numElements = numElements;
        this.index = -1;
        this.name = null;
        this.children = [];
        this.links = []
        this.dept = dept;
        this.position.copy(position);
    }
    
    
    addChild(geometry = this.geometry, material =  new THREE.MeshPhongMaterial({color: "white"}), dept = this.dept) {
        let childGeometry = new THREE.SphereGeometry(0.15, 64, 64)
        let childMaterial = new THREE.MeshPhongMaterial({color: "blue", transparent: true, opacity: 0.5})
        let childMaterial2 = new THREE.MeshPhongMaterial({color: "black", transparent: true, opacity: 0.5})
        actualElement++
        let plus = 0
        // let childrenLength = this.children.length+1
        // if(this.children.length%2 == 0)
        //     plus = -1 * Math.ceil(childrenLength/2)
        // else
        //     plus = 1 * Math.ceil(childrenLength/2)
        // if(dept%2 == 0){
            //this.addLine(this.position, fibonacciSphere(numElements, actualElement))
            this.setArc3D(this.position, fibonacciSphere(numElements, actualElement), 100, "white", false)
            this.children.push(new Node(childGeometry, childMaterial, dept+1 , fibonacciSphere(numElements, actualElement)));
            // }
            // else{
                //     this.setArc3D(this.position, fibonacciSphere(numElements, actualElement), 100, "white", true)
                //     this.children.push(new Node(childGeometry, childMaterial, dept+1 , fibonacciSphere(numElements, actualElement)));
                // }
                scene.add(this)
            }
        setArc3D(pointStart, pointEnd, smoothness, color, clockWise) {
                // calculate a normal ( taken from Geometry().computeFaceNormals() )
        var cb = new THREE.Vector3(), ab = new THREE.Vector3(), normal = new THREE.Vector3();
        cb.subVectors(new THREE.Vector3(), pointEnd);
        ab.subVectors(pointStart, pointEnd);
        cb.cross(ab);
        normal.copy(cb).normalize();
        
        
        var angle = pointStart.angleTo(pointEnd); // get the angle between vectors
        if (clockWise) angle = angle - Math.PI * 2;  // if clockWise is true, then we'll go the longest path
        var angleDelta = angle / (smoothness - 1); // increment
        
        var geometry = new THREE.BufferGeometry();
        let points = [];
        for (var i = 0; i < smoothness; i++) {
            points.push(pointStart.clone().applyAxisAngle(normal, angleDelta * i))  // this is the key operation
        }
        geometry.setFromPoints(points)
        var arc = new THREE.Line(geometry, new THREE.LineBasicMaterial({
            color: color
        }));
        scene.add(arc);
    }
    addLine(firstPos, secondPos){
        var lineMaterial = new THREE.LineBasicMaterial({
            color: "white",
        });
        let points = [];
        points.push(firstPos)
        points.push(secondPos)
        let lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        let line = new THREE.Line(lineGeometry, lineMaterial)
        this.links.push(line);
        scene.add(line)
    }
    addSelfLoop(){
        this.setArc3D(this.position, this.position, 100, "white", false)
    }
    pos(){
        let plus = 0
        let childrenLength = this.children.length+1
        if(this.children.length%2 == 0)
        plus = -1 * Math.ceil(childrenLength/2)
        else
        plus = 1 * Math.ceil(childrenLength/2)
        return new THREE.Vector3(this.position.x, this.position.y, this.position.z)
    }
}
let Raiz = new Node(geometry, material, 0, fibonacciSphere(numElements, actualElement))
Raiz.index = data.nodes[0].id
Raiz.name = data.nodes[0].name
let Nodes = data.nodes.length
let Links = data.links
function createAFD(pai) {
    if(Nodes != 0) {
        for(let i = 0; i < Links.length; i++){
            if(Links[i].source == pai.index){
                pai.addChild()
                pai.children[pai.children.length - 1].index = Links[i].target
            }
        }
        for(let i = 0; i < pai.children.length; i++){
            Nodes--
            createAFD(pai.children[i])
        }
    }
}
scene.add(Raiz)
//createAFD(Raiz)
Raiz.addChild()
Raiz.addChild()
Raiz.children[0].addChild()
Raiz.children[0].addChild()
Raiz.children[0].addChild()
Raiz.children[1].addChild()
Raiz.children[1].addChild()
Raiz.children[1].addChild()
Raiz.children[0].children[0].addChild()
Raiz.children[0].children[0].addChild()
Raiz.children[0].children[0].addChild()
Raiz.children[0].children[0].addChild()
Raiz.children[0].children[1].addChild()
Raiz.children[0].children[1].addChild()
Raiz.children[0].children[1].addChild()
Raiz.children[0].children[1].addChild()
Raiz.children[0].children[2].addChild()
Raiz.children[0].children[2].addChild()
Raiz.children[0].children[2].addChild()
Raiz.children[0].children[2].addChild()
Raiz.children[1].children[0].addChild()
Raiz.children[1].children[0].addChild()
Raiz.children[1].children[0].addChild()
Raiz.children[1].children[1].addChild()
Raiz.children[1].children[1].addChild()
Raiz.children[0].children[0].children[0].addChild()
Raiz.children[0].children[0].children[0].addChild()
Raiz.children[1].children[0].children[0].addChild()
Raiz.children[1].children[1].children[0].addChild()
Raiz.children[1].children[1].children[0].addChild()
Raiz.children[1].children[1].children[0].addChild()



//////////////////////////////////////////////////////////////////////////////////////

render();
function render()
{
    requestAnimationFrame(render);
    renderer.render(scene, camera)
}