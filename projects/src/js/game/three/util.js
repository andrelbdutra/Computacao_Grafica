import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export function degreeToRadians(angle)
{
    return angle * (Math.PI / 180);
}

export function generateDefaultSceneObjects(canvasElement)
{
    const renderer = new THREE.WebGLRenderer({canvas: canvasElement});
    renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight, false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, renderer.domElement.clientWidth / renderer.domElement.clientHeight, 1, 1000);
    camera.position.set(0,15,30);
    const controls = new OrbitControls(camera,renderer.domElement);
    
    const ambientLight = new THREE.HemisphereLight('white','darkslategrey',0.5);
    const mainLight = new THREE.DirectionalLight('white',0.7);
    mainLight.position.set(2,1,1);

    scene.add(ambientLight);
    scene.add(mainLight);

    return {
        renderer: renderer,
        scene: scene,
        camera: camera,
        controls: controls,
        ambientLight: ambientLight,
        mainLight: mainLight
    };
}

export function resizeCanvasToDisplaySize(renderer,camera)
{
    if(renderer.domElement.width !== renderer.domElement.clientWidth || renderer.domElement.height !== renderer.domElement.clientHeight)
    {
        renderer.setSize(renderer.domElement.clientWidth,renderer.domElement.clientHeight,false);
        camera.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
        camera.updateProjectionMatrix();
    }
}

function getMaxSize(object)
{
    let maxSize;

    const box = new THREE.Box3().setFromObject(object);
    const min = box.min;
    const max = box.max;

    const size = new THREE.Box3();
    size.x = max.x - min.x;
    size.y = max.y - min.y;
    size.z = max.z - min.z;

    if(size.x >= size.y && size.x >= size.z)
    {
        maxSize = size.x;
    }
    else
    {
        if(size.y >= size.z)
        {
            maxSize = size.y;
        }
        else
        {
            maxSize = size.z;
        }
    }
    
    return maxSize;
}

function normalizeAndRescale(object,newScale)
{
    const scale = getMaxSize(object);
    object.scale.set(newScale * 1.0/scale, newScale * 1.0/scale, newScale * 1.0/scale);
}

export function loadGLBFile(path,modelName,scale)
{
    const objectToAdd = new THREE.Object3D();
    const loader = new GLTFLoader();
    loader.load(path,function(gltf){
        const obj = gltf.scene;
        obj.name = modelName;
        obj.visible = true;
        obj.traverse(function(child){
            if(child)
            {
                child.castShadow = true;
            }
        });
        obj.traverse(function(node){
            if(node.material)
            {
                node.material.side = THREE.DoubleSide;
            }
        });
        normalizeAndRescale(obj,scale);
        objectToAdd.add(obj);
    });

    return objectToAdd;
}

export function loadDefaultActor()
{
    const path = new URL("../../../assets/models/eve.glb",import.meta.url).toString();
    const obj = loadGLBFile(path,"eve",2.0);
    const interactionReference = new THREE.Object3D();
    interactionReference.name = 'interactionReference';
    interactionReference.translateZ(2);
    obj.rotateY(degreeToRadians(90));
    obj.add(interactionReference);
    return obj;
}

export function loadOBJFile(path,modelName,texture,scale)
{
    const objectToAdd = new THREE.Object3D();
    const objLoader = new OBJLoader();
    objLoader.load(path,function(object){
        object.name = modelName;
        object.visible = true;
        object.traverse(function(child){
            if(child)
            {
                child.castShadow = true;
            }
        });
        object.traverse(function(node){
            if(node.material)
            {
                node.material.side = THREE.DoubleSide;
                if(texture)
                {
                    node.material.map = texture;
                }
            }
        })
        normalizeAndRescale(object,scale);
        objectToAdd.add(object);
    });

    return objectToAdd;
}

export function loadDefaultObjectives(amount)
{
    const objectives = [];
    const texPath = new URL("../../../assets/textures/crystal.jpg",import.meta.url).toString();
    const objPath = new URL("../../../assets/models/crystal.obj",import.meta.url).toString();
    const texture = new THREE.TextureLoader().load(texPath);

    for(let i = 0; i < amount; i++)
    {
        objectives.push(loadOBJFile(objPath,"crystal",texture,2.0));
        objectives[i].rotateX(degreeToRadians(-90));
    }

    return objectives;
}

function leanMovement(actor,mode)
{
    let angleRotated = 0;
    let totalRotation = 15;
    let requestID;

    function rotate()
    {
        if(angleRotated < totalRotation)
        {
            if(mode == 0)
            {
                actor.rotateX(degreeToRadians(3));
            }
            else
            {
                actor.rotateX(degreeToRadians(-3));
            }
            angleRotated += 3;
            requestID = requestAnimationFrame(rotate);
        }
        else
        {
            cancelAnimationFrame(requestID);
        }
    }

    requestID = requestAnimationFrame(rotate);
}

export function translateActor(actor, amount, gridMapHelper, sceneProperties, consoleElement)
{
    const objCopy = actor.clone(false);
    objCopy.translateZ(amount * gridMapHelper.getMultiplier());
    let finalPosition = objCopy.position;
    let requestID;
    let alpha = 0.01;
    let modeGo = amount > 0 ? 0 : 1;
    let modeBack = amount > 0 ? 1 : 0;

    function positionAlmostEqual(positionA,positionB)
    {
        if(positionA.x.toFixed(2) == positionB.x.toFixed(2) && positionA.z.toFixed(2) == positionB.z.toFixed(2))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    leanMovement(actor.getObjectByName('eve'),modeGo);
    return new Promise(function(resolve){
        function translate()
        {
            let newPosition = gridMapHelper.collisionTests(actor.position,finalPosition);
            if(!positionAlmostEqual(finalPosition,newPosition))
            {
                finalPosition = newPosition;
                consoleElement.innerText += "Aviso: Não é possível avançar mais por este caminho, seguindo para o próximo comando.\n";
            }
            
            if(gridMapHelper.trapCollision(actor.position))
            {
                consoleElement.innerText += "Aviso: Robô caiu na armadilha.\n";
                sceneProperties.cancelExecution = true;
            }

            if(gridMapHelper.fireCollision(actor.position))
            {
                consoleElement.innerText += "Aviso: Robô foi queimado!\n";
                sceneProperties.cancelExecution = true;
            }

            if(gridMapHelper.laserCollision(actor.position))
            {
                consoleElement.innerText += "Aviso: Robô foi queimado pelo laser!\n";
                sceneProperties.cancelExecution = true;
            }

            if(!positionAlmostEqual(actor.position,finalPosition) && !sceneProperties.cancelExecution)
            {
                actor.position.lerp(finalPosition,alpha);
                alpha += 0.001;
                requestID = requestAnimationFrame(translate);
            }
            else
            {
                leanMovement(actor.getObjectByName('eve'),modeBack);
                cancelAnimationFrame(requestID);
                resolve();
            }
        }

        requestAnimationFrame(translate);
    });
}

export function rotateActor(actor, amount, sceneProperties, direction)
{
    let angleRotated = 0;
    let requestID;
    const totalRotation = Math.abs(amount);
    const directionCorrected = direction > 0 ? 1 : -1;

    return new Promise(function(resolve){
        function rotate()
        {
            if(angleRotated < totalRotation && !sceneProperties.cancelExecution)
            {
                actor.rotateY(degreeToRadians(1*directionCorrected));
                angleRotated++;
                requestID = requestAnimationFrame(rotate);
            }
            else
            {
                cancelAnimationFrame(requestID);
                resolve();
            }
        }

        requestID = requestAnimationFrame(rotate);
    });
}

export function checkCollision(objectA,objectB,gridMapHelper)
{
    const vec = new THREE.Vector3();
    objectA.getWorldPosition(vec);
    if(gridMapHelper.getXCoordFromGlobalPosition(vec.x) == gridMapHelper.getXCoordFromGlobalPosition(objectB.position.x) && gridMapHelper.getZCoordFromGlobalPosition(vec.z) == gridMapHelper.getZCoordFromGlobalPosition(objectB.position.z))
    {
        return true;
    }
    else
    {
        return false;
    }
}