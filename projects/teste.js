import * as THREE from 'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';

// Criando a cena, a câmera e o renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Criando as esferas
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const vertexCoords = [
  { x: -2, y: 0, z: 0 }, // Vértice 1
  { x: 0, y: 0, z: 0 },  // Vértice 2
  { x: 2, y: 0, z: 0 },  // Vértice 3
  { x: 0, y: 2, z: 0 },  // Vértice 4
];
const spheres = vertexCoords.map(coord => {
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.position.set(coord.x, coord.y, coord.z);
  scene.add(sphereMesh);
  return sphereMesh;
});

// Criando os cilindros
const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 32);
const cylinderMaterial = new THREE.MeshBasicMaterial({ color: "blue" });

// Aresta 1-3
const cylinderMesh1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinderMesh1.position.set(vertexCoords[0].x, vertexCoords[0].y, vertexCoords[0].z);
cylinderMesh1.lookAt(vertexCoords[2].x, vertexCoords[2].y, vertexCoords[2].z);
scene.add(cylinderMesh1);

// Aresta 1-2
const cylinderMesh2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinderMesh2.position.set(vertexCoords[0].x, vertexCoords[0].y, vertexCoords[0].z);
cylinderMesh2.lookAt(vertexCoords[1].x, vertexCoords[1].y, vertexCoords[1].z);
scene.add(cylinderMesh2);
// Aresta 2-3
const cylinderMesh3 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinderMesh3.position.set(vertexCoords[1].x, vertexCoords[1].y, vertexCoords[1].z);
cylinderMesh3.lookAt(vertexCoords[2].x, vertexCoords[2].y, vertexCoords[2].z);
scene.add(cylinderMesh3);

// Aresta 3-4
const cylinderMesh4 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinderMesh4.position.set(vertexCoords[2].x, vertexCoords[2].y, vertexCoords[2].z);
cylinderMesh4.lookAt(vertexCoords[3].x, vertexCoords[3].y, vertexCoords[3].z);
scene.add(cylinderMesh4);

// Aresta 2-4
const cylinderMesh5 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinderMesh5.position.set(vertexCoords[1].x, vertexCoords[1].y, vertexCoords[1].z);
cylinderMesh5.lookAt(vertexCoords[3].x, vertexCoords[3].y, vertexCoords[3].z);
scene.add(cylinderMesh5);

// Adicionando luz ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Adicionando luz direcional
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Posicionando a câmera
camera.position.z = 5;

// Adicionando o OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// Animação da cena
function animate() {
  requestAnimationFrame(animate);

  // Atualizando o OrbitControls
  controls.update();

  // Rotacionando as esferas
  spheres.forEach(sphereMesh => {
    sphereMesh.rotation.x += 0.01;
    sphereMesh.rotation.y += 0.01;
  });

  renderer.render(scene, camera);
}

animate();