import * as THREE from "three";
import { generateDefaultEditor, readOnlyState, editState } from "../editor";
import {
    generateDefaultSceneObjects,
    resizeCanvasToDisplaySize,
    loadDefaultActor,
    loadDefaultObjectives,
    translateActor,
    rotateActor,
    checkCollision,
    degreeToRadians
} from "../three/util";
import GridMapHelper from "../three/GridMapHelper";
import FireBase from "../three/FireBase";
import {SpikeTrap, trapsActivation, trapsDeactivation} from "../three/SpikeTrap";
import parseCode from "./parser";

//Defining Level 2 Scene's Properties

const sceneProperties = {
    cancelExecution: false,
    phase: 0,
    executing: false
}

let extinguisherUses;
function displayExtinguisherUses()
{
    document.getElementById("extinguisherUses").innerText = `x${extinguisherUses}`;
}

let fireState;

let setFireStates;

let setFireStatesInterval;

let spikeTrapState;

let setSpikeTrapState;

let setSpikeTrapStateInterval;

const editor = generateDefaultEditor(document.getElementById("editorArea"));

const consoleElement = document.getElementById('consoleArea');

const {renderer, scene, camera, controls} = generateDefaultSceneObjects(document.getElementById("phaseView"));

const gridMapHelper = new GridMapHelper();

const plane = gridMapHelper.createGridPlane();

const actor = loadDefaultActor();

let objectives;
let walls;
let traps;
const fireClock = new THREE.Clock();
let fires;
function changeFireActiveStatus(index,status)
{
    gridMapHelper.fires[index].active = status;
    fires[index].setFireVisibility(status);
}
function firesVisualRestart()
{
    for(let i = 0;i < fires.length;i++)
    {
        fires[i].setFireVisibility(true);
    }
}

scene.add(plane);
scene.add(actor);


console.log(editor)

async function andarFrente(amount)
{
    await translateActor(actor,amount,gridMapHelper,sceneProperties,consoleElement);
}

async function andarTras(amount)
{
    await translateActor(actor,-amount,gridMapHelper,sceneProperties,consoleElement);
}

async function girarEsquerda()
{
    await rotateActor(actor,90,sceneProperties,1);
}

async function girarDireita()
{
    await rotateActor(actor,90,sceneProperties,-1);
}

async function darMeiaVolta()
{
    await rotateActor(actor,180,sceneProperties,1);
}

function pegandoFogo()
{
    const vec = new THREE.Vector3();
    actor.getObjectByName('interactionReference').getWorldPosition(vec);
    if(gridMapHelper.detectFire(vec) != null)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function apagarFogo()
{
    if(extinguisherUses > 0)
    {
        const vec = new THREE.Vector3();
        actor.getObjectByName('interactionReference').getWorldPosition(vec);
        let fireIndex = gridMapHelper.detectFire(vec);

        if(fireIndex != null)
        {
            changeFireActiveStatus(fireIndex,false);
        }
        extinguisherUses--;
        displayExtinguisherUses();
    }
    else
    {
        consoleElement.innerText += "Aviso: Robô está sem extintores!\n";
    }
}

function badLuck(position)
{
    const vector = new THREE.Vector3(gridMapHelper.getGlobalXPositionFromCoord(position[0]),0,gridMapHelper.getGlobalZPositionFromCoord(position[1]));
    let fireIndex = gridMapHelper.detectFire(vector,false);

    if(fireIndex != null)
    {
        changeFireActiveStatus(fireIndex,true);
    }
}

let coletarCristal;

let resetLevel;

let winCondition;

const phaseGeneration = [];

//Functions to create the phases

//Phase 1
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 2 - Fase 1 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar ao cristal, após isso, o colete.";

        extinguisherUses = 1;
        
        camera.position.set(0,15,30);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(1);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        scene.add(objectives[0]);

        walls = [];
        const boxGeometry = new THREE.BoxGeometry(18,2,2);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(4));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(6));
        scene.add(walls[0]);
        scene.add(walls[1]);
        gridMapHelper.addObstacle(1,9,4,4);
        gridMapHelper.addObstacle(1,9,6,6);

        fires = [];
        fires.push(new FireBase());
        fires[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.1,gridMapHelper.getGlobalZPositionFromCoord(5));
        gridMapHelper.addFire(7,5);
        scene.add(fires[0]);

        coletarCristal = () => {
            if(sceneProperties.cancelExecution)
            {
                return;
            }

            if(checkCollision(actor.getObjectByName('interactionReference'),objectives[0],gridMapHelper))
            {
                objectives[0].visible = false;
                consoleElement.innerText += "Cristal coletado com sucesso.\n";
            }
            else
            {
                consoleElement.innerText += "Robô não está em frente ao cristal.\n";
            }
        }

        resetLevel = () =>{
            actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
            actor.rotation.set(0,degreeToRadians(90),0);
            actor.getObjectByName('eve').rotation.set(0,0,0);
            objectives[0].visible = true;
            gridMapHelper.restartFires();
            fires[0].setFireVisibility(true);
            extinguisherUses = 1;
            displayExtinguisherUses();
        }

        winCondition = () =>{
            if(!objectives[0].visible)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
);

//Phase 2
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 2 - Fase 2 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar ao cristal, após isso, o colete.";

        extinguisherUses = 1;
        displayExtinguisherUses();
        sceneProperties.executing = false;

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(1);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        scene.add(objectives[0]);

        walls = [];
        const boxGeometry = new THREE.BoxGeometry(14,2,2);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(2));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(4));
        walls[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(6));
        walls[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(8));
        gridMapHelper.addObstacle(2,8,2,2);
        gridMapHelper.addObstacle(2,8,4,4);
        gridMapHelper.addObstacle(2,8,6,6);
        gridMapHelper.addObstacle(2,8,8,8);
        scene.add(walls[0]);
        scene.add(walls[1]);
        scene.add(walls[2]);
        scene.add(walls[3]);

        fires = [];
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(3),0.1,gridMapHelper.getGlobalZPositionFromCoord(3));
        fires[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0.1,gridMapHelper.getGlobalZPositionFromCoord(3));
        fires[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(3),0.1,gridMapHelper.getGlobalZPositionFromCoord(7));
        fires[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0.1,gridMapHelper.getGlobalZPositionFromCoord(7));
        fires[4].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.1,gridMapHelper.getGlobalZPositionFromCoord(6));
        gridMapHelper.addFire(3,3);
        gridMapHelper.addFire(6,3);
        gridMapHelper.addFire(3,7);
        gridMapHelper.addFire(6,7);
        gridMapHelper.addFire(9,6);
        fireState = 0;
        setFireStates = () => {
            if(fireState == 0)
            {
                changeFireActiveStatus(0,false);
                changeFireActiveStatus(3,false);

                changeFireActiveStatus(1,true);
                changeFireActiveStatus(4,true);
            }
            else
            {
                changeFireActiveStatus(0,true);
                changeFireActiveStatus(3,true);

                changeFireActiveStatus(1,false);
                changeFireActiveStatus(4,false);
            }
        }
        scene.add(fires[0]);
        scene.add(fires[1]);
        scene.add(fires[2]);
        scene.add(fires[3]);
        scene.add(fires[4]);

        traps = [];
        traps.push(new SpikeTrap());
        traps.push(new SpikeTrap());
        traps.push(new SpikeTrap());
        traps[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0,gridMapHelper.getGlobalZPositionFromCoord(2));
        traps[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),0,gridMapHelper.getGlobalZPositionFromCoord(5));
        traps[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0,gridMapHelper.getGlobalZPositionFromCoord(8));
        gridMapHelper.addTrap(9,2,traps[0]);
        gridMapHelper.addTrap(8,5,traps[1]);
        gridMapHelper.addTrap(9,8,traps[2]);
        scene.add(traps[0]);
        scene.add(traps[1]);
        scene.add(traps[2]);

        coletarCristal = () => {
            if(sceneProperties.cancelExecution)
            {
                return;
            }

            if(checkCollision(actor.getObjectByName('interactionReference'),objectives[0],gridMapHelper))
            {
                objectives[0].visible = false;
                consoleElement.innerText += "Cristal coletado com sucesso.\n";
            }
            else
            {
                consoleElement.innerText += "Robô não está em frente ao cristal.\n";
            }
        }

        resetLevel = () =>{
            actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
            actor.rotation.set(0,degreeToRadians(90),0);
            actor.getObjectByName('eve').rotation.set(0,0,0);
            objectives[0].visible = true;
            gridMapHelper.restartFires();
            firesVisualRestart();
            setFireStates();
            extinguisherUses = 1;
            displayExtinguisherUses();
        }

        winCondition = () =>{
            if(!objectives[0].visible)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        setFireStatesInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            fireState = (fireState + 1) % 2;
            setFireStates();
        },1000);

        spikeTrapState = 0;
        setSpikeTrapState = () => {
            if(spikeTrapState == 0)
            {
                trapsDeactivation(traps)
            }
            else
            {
                trapsActivation(traps)

            }
        }

        setSpikeTrapStateInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            spikeTrapState = (spikeTrapState + 1) % 2;
            setSpikeTrapState();
        },1000);
    }
);

//Phase 3
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 2 - Fase 3 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar aos cristais, após isso, os colete.";

        extinguisherUses = 1;
        displayExtinguisherUses();
        sceneProperties.executing = false;

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(2);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(0),0.0,gridMapHelper.getGlobalZPositionFromCoord(0));
        objectives[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.0,gridMapHelper.getGlobalZPositionFromCoord(9));
        scene.add(objectives[0]);
        scene.add(objectives[1]);

        walls = [];
        const boxGeometry = new THREE.BoxGeometry(12,2,2);
        const boxGeometry2 = new THREE.BoxGeometry(2,2,2);
        const boxGeometry3 = new THREE.BoxGeometry(2,2,14);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry3,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(3.5),1,gridMapHelper.getGlobalZPositionFromCoord(2));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1,gridMapHelper.getGlobalZPositionFromCoord(1));
        walls[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),1,gridMapHelper.getGlobalZPositionFromCoord(7));
        walls[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),1,gridMapHelper.getGlobalZPositionFromCoord(5));
        gridMapHelper.addObstacle(1,6,2,2);
        gridMapHelper.addObstacle(2,2,1,1);
        gridMapHelper.addObstacle(8,8,7,7);
        gridMapHelper.addObstacle(7,7,3,8);
        scene.add(walls[0]);
        scene.add(walls[1]);
        scene.add(walls[2]);
        scene.add(walls[3]);

        fires = [];
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(0),0.1,gridMapHelper.getGlobalZPositionFromCoord(2));
        fires[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0.1,gridMapHelper.getGlobalZPositionFromCoord(0));
        fires[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.1,gridMapHelper.getGlobalZPositionFromCoord(7));
        gridMapHelper.addFire(0,2);
        gridMapHelper.addFire(2,0);
        gridMapHelper.addFire(9,7);
        fireState = 0;
        setFireStates = () => {
            if(fireState == 0)
            {
                changeFireActiveStatus(1,false);
                
                changeFireActiveStatus(2,true);
            }
            else
            {
                changeFireActiveStatus(1,true);
                
                changeFireActiveStatus(2,false);
            }
        }
        scene.add(fires[0]);
        scene.add(fires[1]);
        scene.add(fires[2]);

        coletarCristal = () => {
            if(sceneProperties.cancelExecution)
            {
                return;
            }

            if(checkCollision(actor.getObjectByName('interactionReference'),objectives[0],gridMapHelper))
            {
                objectives[0].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else if(checkCollision(actor.getObjectByName('interactionReference'),objectives[1],gridMapHelper))
            {
                objectives[1].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else
            {
                consoleElement.innerText += "Robô não está em frente ao cristal.\n";
            }

            if(!objectives[0].visible && !objectives[1].visible)
            {
                consoleElement.innerText += "Todos os cristais coletados com sucesso!\n";
            }
        }

        resetLevel = () =>{
            actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
            actor.rotation.set(0,degreeToRadians(90),0);
            actor.getObjectByName('eve').rotation.set(0,0,0);
            objectives[0].visible = true;
            objectives[1].visible = true;
            gridMapHelper.restartFires();
            firesVisualRestart();
            setFireStates();
            extinguisherUses = 1;
            displayExtinguisherUses();
        }

        winCondition = () =>{
            if(!objectives[0].visible && !objectives[1].visible)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        setFireStatesInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            fireState = (fireState + 1) % 2;
            setFireStates();
        },1000);
    }
);

//Phase 4
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 2 - Fase 4 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar aos cristais, após isso, os colete.";

        extinguisherUses = 1;
        displayExtinguisherUses();
        sceneProperties.executing = false;

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(2);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.0,gridMapHelper.getGlobalZPositionFromCoord(9));
        objectives[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.0,gridMapHelper.getGlobalZPositionFromCoord(0));
        scene.add(objectives[0]);
        scene.add(objectives[1]);

        walls = [];
        const boxGeometry = new THREE.BoxGeometry(16,2,2);
        const boxGeometry2 = new THREE.BoxGeometry(2,2,6);
        const boxGeometry3 = new THREE.BoxGeometry(2,2,8);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry3,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(4.5),1,gridMapHelper.getGlobalZPositionFromCoord(4));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(4.5),1,gridMapHelper.getGlobalZPositionFromCoord(6));
        walls[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),1,gridMapHelper.getGlobalZPositionFromCoord(8));
        walls[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),1,gridMapHelper.getGlobalZPositionFromCoord(1.5));
        gridMapHelper.addObstacle(1,8,4,4);
        gridMapHelper.addObstacle(1,8,6,6);
        gridMapHelper.addObstacle(8,8,7,9);
        gridMapHelper.addObstacle(8,8,0,3);
        scene.add(walls[0]);
        scene.add(walls[1]);
        scene.add(walls[2]);
        scene.add(walls[3]);

        fires = [];
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.1,gridMapHelper.getGlobalZPositionFromCoord(3));
        fires[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.1,gridMapHelper.getGlobalZPositionFromCoord(7));
        gridMapHelper.addFire(9,3);
        gridMapHelper.addFire(9,7);
        fireState = 0;
        setFireStates = () => {
            if(fireState == 0)
            {
                changeFireActiveStatus(0,false);
                
                changeFireActiveStatus(1,true);
            }
            else
            {
                changeFireActiveStatus(0,true);
                
                changeFireActiveStatus(1,false);
            }
        }
        scene.add(fires[0]);
        scene.add(fires[1]);

        coletarCristal = () => {
            if(sceneProperties.cancelExecution)
            {
                return;
            }

            if(checkCollision(actor.getObjectByName('interactionReference'),objectives[0],gridMapHelper))
            {
                objectives[0].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else if(checkCollision(actor.getObjectByName('interactionReference'),objectives[1],gridMapHelper))
            {
                objectives[1].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else
            {
                consoleElement.innerText += "Robô não está em frente ao cristal.\n";
            }

            if(!objectives[0].visible && !objectives[1].visible)
            {
                consoleElement.innerText += "Todos os cristais coletados com sucesso!\n";
            }
        }

        resetLevel = () =>{
            actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
            actor.rotation.set(0,degreeToRadians(90),0);
            actor.getObjectByName('eve').rotation.set(0,0,0);
            objectives[0].visible = true;
            objectives[1].visible = true;
            gridMapHelper.restartFires();
            firesVisualRestart();
            setFireStates();
            extinguisherUses = 1;
            displayExtinguisherUses();
        }

        winCondition = () =>{
            if(!objectives[0].visible && !objectives[1].visible)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        setFireStatesInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            fireState = (fireState + 1) % 2;
            setFireStates();
        },1000);
    }
);

//Phase 5
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 2 - Fase 5 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar aos cristais, após isso, os colete.";

        extinguisherUses = 1;
        displayExtinguisherUses();
        sceneProperties.executing = false;

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(2);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0.0,gridMapHelper.getGlobalZPositionFromCoord(7));
        objectives[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0.0,gridMapHelper.getGlobalZPositionFromCoord(3));
        scene.add(objectives[0]);
        scene.add(objectives[1]);

        walls = [];
        const boxGeometry = new THREE.BoxGeometry(10,2,2);
        const boxGeometry2 = new THREE.BoxGeometry(2,2,2);
        const boxGeometry3 = new THREE.BoxGeometry(2,2,6);
        const boxGeometry4 = new THREE.BoxGeometry(4,2,6);
        const boxGeometry5 = new THREE.BoxGeometry(12,2,2);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry4,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry3,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry5,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(8));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),1,gridMapHelper.getGlobalZPositionFromCoord(6));
        walls[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(3.5),1,gridMapHelper.getGlobalZPositionFromCoord(5));
        walls[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),1,gridMapHelper.getGlobalZPositionFromCoord(5));
        walls[4].position.set(gridMapHelper.getGlobalXPositionFromCoord(5.5),1,gridMapHelper.getGlobalZPositionFromCoord(2));
        walls[5].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),1,gridMapHelper.getGlobalZPositionFromCoord(4));
        gridMapHelper.addObstacle(3,7,8,8);
        gridMapHelper.addObstacle(7,7,6,6);
        gridMapHelper.addObstacle(3,4,4,6);
        gridMapHelper.addObstacle(6,6,4,6);
        gridMapHelper.addObstacle(3,8,2,2);
        gridMapHelper.addObstacle(7,7,4,4);
        scene.add(walls[0]);
        scene.add(walls[1]);
        scene.add(walls[2]);
        scene.add(walls[3]);
        scene.add(walls[4]);
        scene.add(walls[5]);

        traps = [];
        traps.push(new SpikeTrap());
        traps[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0,gridMapHelper.getGlobalZPositionFromCoord(5));
        gridMapHelper.addTrap(5,5,traps[0]);
        scene.add(traps[0]);

        fires = [];
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(3),0.1,gridMapHelper.getGlobalZPositionFromCoord(7));
        fires[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.1,gridMapHelper.getGlobalZPositionFromCoord(7));
        fires[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.1,gridMapHelper.getGlobalZPositionFromCoord(3));
        fires[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(3),0.1,gridMapHelper.getGlobalZPositionFromCoord(3));
        fires[4].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.1,gridMapHelper.getGlobalZPositionFromCoord(2));
        gridMapHelper.addFire(3,7);
        gridMapHelper.addFire(7,7);
        gridMapHelper.addFire(7,3);
        gridMapHelper.addFire(3,3);
        gridMapHelper.addFire(9,2);
        fireState = 0;
        setFireStates = () => {
            if(fireState == 0)
            {
                changeFireActiveStatus(1,false);
                
                changeFireActiveStatus(2,true);
            }
            else
            {
                changeFireActiveStatus(1,true);
                
                changeFireActiveStatus(2,false);
            }
        }
        scene.add(fires[0]);
        scene.add(fires[1]);
        scene.add(fires[2]);
        scene.add(fires[3]);
        scene.add(fires[4]);

        coletarCristal = () => {
            if(sceneProperties.cancelExecution)
            {
                return;
            }

            if(checkCollision(actor.getObjectByName('interactionReference'),objectives[0],gridMapHelper))
            {
                objectives[0].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else if(checkCollision(actor.getObjectByName('interactionReference'),objectives[1],gridMapHelper))
            {
                objectives[1].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else
            {
                consoleElement.innerText += "Robô não está em frente ao cristal.\n";
            }

            if(!objectives[0].visible && !objectives[1].visible)
            {
                consoleElement.innerText += "Todos os cristais coletados com sucesso!\n";
            }
        }

        resetLevel = () =>{
            actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
            actor.rotation.set(0,degreeToRadians(90),0);
            actor.getObjectByName('eve').rotation.set(0,0,0);
            objectives[0].visible = true;
            objectives[1].visible = true;
            gridMapHelper.restartFires();
            firesVisualRestart();
            setFireStates();
            extinguisherUses = 1;
            displayExtinguisherUses();
        }

        winCondition = () =>{
            if(!objectives[0].visible && !objectives[1].visible)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        setFireStatesInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            fireState = (fireState + 1) % 2;
            setFireStates();
        },1000);

        spikeTrapState = 0;
        setSpikeTrapState = () => {
            if(spikeTrapState == 0)
            {
                trapsDeactivation(traps)
            }
            else
            {
                trapsActivation(traps)

            }
        }

        setSpikeTrapStateInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            spikeTrapState = (spikeTrapState + 1) % 2;
            setSpikeTrapState();
        },1000);
    }
);
//Phase 6
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 2 - Fase 6 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar aos cristais, após isso, os colete.";

        extinguisherUses = 1;
        displayExtinguisherUses();
        sceneProperties.executing = false;

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(2);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0.0,gridMapHelper.getGlobalZPositionFromCoord(7));
        objectives[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.0,gridMapHelper.getGlobalZPositionFromCoord(0));
        scene.add(objectives[0]);
        scene.add(objectives[1]);

        walls = [];
        const boxGeometry = new THREE.BoxGeometry(14,2,2);
        const boxGeometry2 = new THREE.BoxGeometry(2,2,2);
        const boxGeometry3 = new THREE.BoxGeometry(2,2,6);
        const boxGeometry4 = new THREE.BoxGeometry(4,2,2);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry3,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry3,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry4,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(8));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1,gridMapHelper.getGlobalZPositionFromCoord(6));
        walls[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(4),1,gridMapHelper.getGlobalZPositionFromCoord(6));
        walls[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(5));
        walls[4].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(2));
        walls[4].rotateY(degreeToRadians(90));
        walls[5].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),1,gridMapHelper.getGlobalZPositionFromCoord(4));
        walls[5].rotateY(degreeToRadians(90));
        walls[6].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),1,gridMapHelper.getGlobalZPositionFromCoord(1));
        walls[7].position.set(gridMapHelper.getGlobalXPositionFromCoord(2.5),1,gridMapHelper.getGlobalZPositionFromCoord(4));
        gridMapHelper.addObstacle(2,8,8,8);
        gridMapHelper.addObstacle(2,2,6,6);
        gridMapHelper.addObstacle(4,4,6,6);
        gridMapHelper.addObstacle(5,5,4,6);
        gridMapHelper.addObstacle(4,6,2,2);
        gridMapHelper.addObstacle(8,8,1,7);
        gridMapHelper.addObstacle(6,6,1,1);
        gridMapHelper.addObstacle(2,3,4,4);
        scene.add(walls[0]);
        scene.add(walls[1]);
        scene.add(walls[2]);
        scene.add(walls[3]);
        scene.add(walls[4]);
        scene.add(walls[5]);
        scene.add(walls[6]);
        scene.add(walls[7]);

        traps = [];
        traps.push(new SpikeTrap());
        traps.push(new SpikeTrap());
        traps.push(new SpikeTrap());
        traps.push(new SpikeTrap());
        traps.push(new SpikeTrap());
        traps[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0,gridMapHelper.getGlobalZPositionFromCoord(5));
        traps[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0,gridMapHelper.getGlobalZPositionFromCoord(3));
        traps[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0,gridMapHelper.getGlobalZPositionFromCoord(7));
        traps[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0,gridMapHelper.getGlobalZPositionFromCoord(6));
        traps[4].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0,gridMapHelper.getGlobalZPositionFromCoord(3));
        gridMapHelper.addTrap(2,5,traps[0]);
        gridMapHelper.addTrap(2,3,traps[1]);
        gridMapHelper.addTrap(2,7,traps[2]);
        gridMapHelper.addTrap(6,6,traps[3]);
        gridMapHelper.addTrap(5,3,traps[4]);
        scene.add(traps[0]);
        scene.add(traps[1]);
        scene.add(traps[2]);
        scene.add(traps[3]);
        scene.add(traps[4]);

        fires = [];
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.1,gridMapHelper.getGlobalZPositionFromCoord(5));
        fires[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0.1,gridMapHelper.getGlobalZPositionFromCoord(0));
        fires[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.1,gridMapHelper.getGlobalZPositionFromCoord(0));
        fires[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.1,gridMapHelper.getGlobalZPositionFromCoord(2));
        gridMapHelper.addFire(7,5);
        gridMapHelper.addFire(5,0);
        gridMapHelper.addFire(9,0);
        gridMapHelper.addFire(7,2);
        fireState = 0;
        setFireStates = () => {
            if(fireState == 0)
            {
                changeFireActiveStatus(0,false);
                
                changeFireActiveStatus(3,true);
            }
            else
            {
                changeFireActiveStatus(0,true);
                
                changeFireActiveStatus(3,false);
            }
        }
        scene.add(fires[0]);
        scene.add(fires[1]);
        scene.add(fires[2]);
        scene.add(fires[3]);

        coletarCristal = () => {
            if(sceneProperties.cancelExecution)
            {
                return;
            }

            if(checkCollision(actor.getObjectByName('interactionReference'),objectives[0],gridMapHelper))
            {
                objectives[0].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else if(checkCollision(actor.getObjectByName('interactionReference'),objectives[1],gridMapHelper))
            {
                objectives[1].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else
            {
                consoleElement.innerText += "Robô não está em frente ao cristal.\n";
            }

            if(!objectives[0].visible && !objectives[1].visible)
            {
                consoleElement.innerText += "Todos os cristais coletados com sucesso!\n";
            }
        }

        resetLevel = () =>{
            actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
            actor.rotation.set(0,degreeToRadians(90),0);
            actor.getObjectByName('eve').rotation.set(0,0,0);
            objectives[0].visible = true;
            objectives[1].visible = true;
            gridMapHelper.restartFires();
            firesVisualRestart();
            setFireStates();
            extinguisherUses = 1;
            displayExtinguisherUses();
        }

        winCondition = () =>{
            if(!objectives[0].visible && !objectives[1].visible)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        setFireStatesInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            fireState = (fireState + 1) % 2;
            setFireStates();
        },1000);

        spikeTrapState = 0;
        setSpikeTrapState = () => {
            if(spikeTrapState == 0)
            {
                trapsDeactivation(traps)
            }
            else
            {
                trapsActivation(traps)

            }
        }

        setSpikeTrapStateInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            spikeTrapState = (spikeTrapState + 1) % 2;
            setSpikeTrapState();
        },1000);
    }
);
//Phase 7
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 2 - Fase 7 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar aos cristais, após isso, os colete.";

        extinguisherUses = 1;
        displayExtinguisherUses();
        sceneProperties.executing = false;

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(2);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(3),0.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        objectives[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.0,gridMapHelper.getGlobalZPositionFromCoord(3));
        scene.add(objectives[0]);
        scene.add(objectives[1]);

        walls = [];
        const boxGeometry = new THREE.BoxGeometry(14,2,2);
        const boxGeometry2 = new THREE.BoxGeometry(2,2,2);
        const boxGeometry3 = new THREE.BoxGeometry(2,2,6);
        const boxGeometry4 = new THREE.BoxGeometry(4,2,2);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry3,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry4,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry4,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry4,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry4,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(8));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1,gridMapHelper.getGlobalZPositionFromCoord(7));
        walls[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1,gridMapHelper.getGlobalZPositionFromCoord(3));
        walls[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(5));
        walls[4].position.set(gridMapHelper.getGlobalXPositionFromCoord(2.5),1,gridMapHelper.getGlobalZPositionFromCoord(6));
        walls[5].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(1));
        walls[6].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1,gridMapHelper.getGlobalZPositionFromCoord(2));
        walls[7].position.set(gridMapHelper.getGlobalXPositionFromCoord(2.5),1,gridMapHelper.getGlobalZPositionFromCoord(4));
        walls[8].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),1,gridMapHelper.getGlobalZPositionFromCoord(7));
        walls[9].position.set(gridMapHelper.getGlobalXPositionFromCoord(7.5),1,gridMapHelper.getGlobalZPositionFromCoord(5));
        walls[10].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),1,gridMapHelper.getGlobalZPositionFromCoord(2.5));
        walls[10].rotateY(degreeToRadians(90));
        gridMapHelper.addObstacle(2,8,8,8);
        gridMapHelper.addObstacle(2,2,7,7);
        gridMapHelper.addObstacle(2,2,3,3);
        gridMapHelper.addObstacle(5,5,4,6);
        gridMapHelper.addObstacle(2,3,6,6);
        gridMapHelper.addObstacle(8,8,1,7);
        gridMapHelper.addObstacle(5,5,2,2);
        gridMapHelper.addObstacle(2,3,4,4);
        gridMapHelper.addObstacle(8,8,7,7);
        gridMapHelper.addObstacle(7,8,5,5);
        gridMapHelper.addObstacle(8,8,2,3);
        scene.add(walls[0]);
        scene.add(walls[1]);
        scene.add(walls[2]);
        scene.add(walls[3]);
        scene.add(walls[4]);
        scene.add(walls[5]);
        scene.add(walls[6]);
        scene.add(walls[7]);
        scene.add(walls[8]);
        scene.add(walls[9]);
        scene.add(walls[10]);

        traps = [];
        traps.push(new SpikeTrap());
        traps.push(new SpikeTrap());
        traps[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0,gridMapHelper.getGlobalZPositionFromCoord(5));
        traps[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0,gridMapHelper.getGlobalZPositionFromCoord(3));
        gridMapHelper.addTrap(2,5,traps[0]);
        gridMapHelper.addTrap(5,3,traps[1]);
        scene.add(traps[0]);
        scene.add(traps[1]);

        fires = [];
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0.1,gridMapHelper.getGlobalZPositionFromCoord(9));
        fires[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0.1,gridMapHelper.getGlobalZPositionFromCoord(0));
        fires[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0.1,gridMapHelper.getGlobalZPositionFromCoord(5));
        fires[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),0.1,gridMapHelper.getGlobalZPositionFromCoord(6));
        fires[4].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),0.1,gridMapHelper.getGlobalZPositionFromCoord(4));
        fires[5].position.set(gridMapHelper.getGlobalXPositionFromCoord(4),0.1,gridMapHelper.getGlobalZPositionFromCoord(5));
        gridMapHelper.addFire(2,9);
        gridMapHelper.addFire(2,0);
        gridMapHelper.addFire(6,5);
        gridMapHelper.addFire(8,6);
        gridMapHelper.addFire(8,4);
        gridMapHelper.addFire(4,5);
        fireState = 0;
        setFireStates = () => {
            if(fireState == 0)
            {
                changeFireActiveStatus(2,false);
                changeFireActiveStatus(3,false);
                changeFireActiveStatus(4,false);
                
                changeFireActiveStatus(0,true);
                changeFireActiveStatus(1,true);
                changeFireActiveStatus(5,true);
            }
            else
            {
                changeFireActiveStatus(2,true);
                changeFireActiveStatus(3,true);
                changeFireActiveStatus(4,true);
                
                changeFireActiveStatus(0,false);
                changeFireActiveStatus(1,false);
                changeFireActiveStatus(5,false);
            }
        }
        scene.add(fires[0]);
        scene.add(fires[1]);
        scene.add(fires[2]);
        scene.add(fires[3]);
        scene.add(fires[4]);
        scene.add(fires[5]);

        coletarCristal = () => {
            if(sceneProperties.cancelExecution)
            {
                return;
            }

            if(checkCollision(actor.getObjectByName('interactionReference'),objectives[0],gridMapHelper))
            {
                objectives[0].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else if(checkCollision(actor.getObjectByName('interactionReference'),objectives[1],gridMapHelper))
            {
                objectives[1].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else
            {
                consoleElement.innerText += "Robô não está em frente ao cristal.\n";
            }

            if(!objectives[0].visible && !objectives[1].visible)
            {
                consoleElement.innerText += "Todos os cristais coletados com sucesso!\n";
            }
        }

        resetLevel = () =>{
            actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
            actor.rotation.set(0,degreeToRadians(90),0);
            actor.getObjectByName('eve').rotation.set(0,0,0);
            objectives[0].visible = true;
            objectives[1].visible = true;
            gridMapHelper.restartFires();
            firesVisualRestart();
            setFireStates();
            extinguisherUses = 1;
            displayExtinguisherUses();
        }

        winCondition = () =>{
            if(!objectives[0].visible && !objectives[1].visible)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        setFireStatesInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            fireState = (fireState + 1) % 2;
            setFireStates();
        },1000);

        spikeTrapState = 0;
        setSpikeTrapState = () => {
            if(spikeTrapState == 0)
            {
                trapsDeactivation(traps)
            }
            else
            {
                trapsActivation(traps)

            }
        }

        setSpikeTrapStateInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            spikeTrapState = (spikeTrapState + 1) % 2;
            setSpikeTrapState();
        },1000);
    }
);
//Phase 8
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 2 - Fase 8 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar aos cristais, após isso, os colete.";

        extinguisherUses = 1;
        displayExtinguisherUses();
        sceneProperties.executing = false;

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(3);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(3),0.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        objectives[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        objectives[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        scene.add(objectives[0]);
        scene.add(objectives[1]);
        scene.add(objectives[2]);

        walls = [];
        const boxGeometry = new THREE.BoxGeometry(2,2,4);
        const boxGeometry2 = new THREE.BoxGeometry(2,2,2);
        const boxGeometry3 = new THREE.BoxGeometry(2,2,6);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry3,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1,gridMapHelper.getGlobalZPositionFromCoord(6.5));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1,gridMapHelper.getGlobalZPositionFromCoord(3.5));
        walls[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1,gridMapHelper.getGlobalZPositionFromCoord(0.5));
        walls[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(4),1,gridMapHelper.getGlobalZPositionFromCoord(1.5));
        walls[4].position.set(gridMapHelper.getGlobalXPositionFromCoord(6.5),1,gridMapHelper.getGlobalZPositionFromCoord(2));
        walls[4].rotateY(degreeToRadians(90));
        walls[5].position.set(gridMapHelper.getGlobalXPositionFromCoord(4),1,gridMapHelper.getGlobalZPositionFromCoord(6));
        walls[6].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),1,gridMapHelper.getGlobalZPositionFromCoord(6));
        walls[7].position.set(gridMapHelper.getGlobalXPositionFromCoord(4),1,gridMapHelper.getGlobalZPositionFromCoord(4));
        walls[8].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),1,gridMapHelper.getGlobalZPositionFromCoord(4));
        walls[9].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),1,gridMapHelper.getGlobalZPositionFromCoord(2));
        gridMapHelper.addObstacle(2,2,6,7);
        gridMapHelper.addObstacle(2,2,3,4);
        gridMapHelper.addObstacle(2,2,0,1);
        gridMapHelper.addObstacle(4,4,1,2);
        gridMapHelper.addObstacle(6,7,2,2);
        gridMapHelper.addObstacle(8,8,1,3);
        gridMapHelper.addObstacle(4,4,6,6);
        gridMapHelper.addObstacle(6,6,6,6);
        gridMapHelper.addObstacle(4,4,4,4);
        gridMapHelper.addObstacle(6,6,4,4);
        scene.add(walls[0]);
        scene.add(walls[1]);
        scene.add(walls[2]);
        scene.add(walls[3]);
        scene.add(walls[4]);
        scene.add(walls[5]);
        scene.add(walls[6]);
        scene.add(walls[7]);
        scene.add(walls[8]);
        scene.add(walls[9]);

        traps = [];
        const trapGeometry = new THREE.BoxGeometry(2,1,2)
        const trapMaterial = new THREE.MeshLambertMaterial({color: "rgb(255,0,0)"})
        traps.push(new SpikeTrap())
        traps.push(new SpikeTrap())
        traps.push(new SpikeTrap())
        traps.push(new SpikeTrap())
        traps.push(new SpikeTrap())
        traps.push(new SpikeTrap())
        traps.push(new SpikeTrap())
        traps[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(4),0,gridMapHelper.getGlobalZPositionFromCoord(7));
        traps[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0,gridMapHelper.getGlobalZPositionFromCoord(7));
        traps[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0,gridMapHelper.getGlobalZPositionFromCoord(5));
        traps[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(4),0,gridMapHelper.getGlobalZPositionFromCoord(5));
        traps[4].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0,gridMapHelper.getGlobalZPositionFromCoord(5));
        traps[5].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),0,gridMapHelper.getGlobalZPositionFromCoord(5));
        traps[6].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0,gridMapHelper.getGlobalZPositionFromCoord(0));
        gridMapHelper.addTrap(4,7,traps[0]);
        gridMapHelper.addTrap(6,7,traps[1]);
        gridMapHelper.addTrap(2,5,traps[2]);
        gridMapHelper.addTrap(4,5,traps[3]);
        gridMapHelper.addTrap(6,5,traps[4]);
        gridMapHelper.addTrap(8,5,traps[5]);
        gridMapHelper.addTrap(6,0,traps[6]);
        scene.add(traps[0]);
        scene.add(traps[1]);
        scene.add(traps[2]);
        scene.add(traps[3]);
        scene.add(traps[4]);
        scene.add(traps[5]);
        scene.add(traps[6]);

        fires = [];
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires.push(new FireBase());
        fires[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(3),0.1,gridMapHelper.getGlobalZPositionFromCoord(7));
        fires[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0.1,gridMapHelper.getGlobalZPositionFromCoord(7));
        fires[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.1,gridMapHelper.getGlobalZPositionFromCoord(7));
        fires[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(3),0.1,gridMapHelper.getGlobalZPositionFromCoord(3));
        fires[4].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0.1,gridMapHelper.getGlobalZPositionFromCoord(3));
        fires[5].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.1,gridMapHelper.getGlobalZPositionFromCoord(3));
        fires[6].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.1,gridMapHelper.getGlobalZPositionFromCoord(5));
        gridMapHelper.addFire(3,7);
        gridMapHelper.addFire(5,7);
        gridMapHelper.addFire(7,7);
        gridMapHelper.addFire(3,3);
        gridMapHelper.addFire(5,3);
        gridMapHelper.addFire(7,3);
        gridMapHelper.addFire(9,5);
        fireState = 0;
        setFireStates = () => {
            if(fireState == 0)
            {
                changeFireActiveStatus(3,false);
                changeFireActiveStatus(5,false);
                
                changeFireActiveStatus(4,true);
                changeFireActiveStatus(6,true);
            }
            else
            {
                changeFireActiveStatus(3,true);
                changeFireActiveStatus(5,true);
                
                changeFireActiveStatus(4,false);
                changeFireActiveStatus(6,false);
            }
        }
        scene.add(fires[0]);
        scene.add(fires[1]);
        scene.add(fires[2]);
        scene.add(fires[3]);
        scene.add(fires[4]);
        scene.add(fires[5]);
        scene.add(fires[6]);

        coletarCristal = () => {
            if(sceneProperties.cancelExecution)
            {
                return;
            }

            if(checkCollision(actor.getObjectByName('interactionReference'),objectives[0],gridMapHelper))
            {
                objectives[0].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else if(checkCollision(actor.getObjectByName('interactionReference'),objectives[1],gridMapHelper))
            {
                objectives[1].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else if(checkCollision(actor.getObjectByName('interactionReference'),objectives[2],gridMapHelper))
            {
                objectives[2].visible = false;
                consoleElement.innerText += "Cristal coletado.\n";
            }
            else
            {
                consoleElement.innerText += "Robô não está em frente ao cristal.\n";
            }

            if(!objectives[0].visible && !objectives[1].visible && !objectives[2].visible)
            {
                consoleElement.innerText += "Todos os cristais coletados com sucesso!\n";
            }
        }

        resetLevel = () =>{
            actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
            actor.rotation.set(0,degreeToRadians(90),0);
            actor.getObjectByName('eve').rotation.set(0,0,0);
            objectives[0].visible = true;
            objectives[1].visible = true;
            objectives[2].visible = true;
            gridMapHelper.restartFires();
            firesVisualRestart();
            setFireStates();
            extinguisherUses = 1;
            displayExtinguisherUses();
        }

        winCondition = () =>{
            if(!objectives[0].visible && !objectives[1].visible && !objectives[2].visible)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        document.getElementById('winMessage').innerText = "Nível Concluído";
        document.getElementById('advanceBtn').innerText = "Finalizar";
        
        setFireStatesInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            fireState = (fireState + 1) % 2;
            setFireStates();
        },1000);

        spikeTrapState = 0;
        setSpikeTrapState = () => {
            if(spikeTrapState == 0)
            {
                trapsDeactivation(traps)
            }
            else
            {
                trapsActivation(traps)

            }
        }

        setSpikeTrapStateInterval = setInterval(() => {
            if(sceneProperties.executing)
            {
                return;
            }

            spikeTrapState = (spikeTrapState + 1) % 2;
            setSpikeTrapState();
        },1000);
    }
);

//Defining function that remove objects, scene render and button's functions

function removeObjects(crystals, walls, traps, fires)
{
    if(crystals != undefined)
    {
        for(let i = 0; i < crystals.length; i++)
        {
            scene.remove(crystals[i]);
        }
    }

    if(walls != undefined)
    {
        for(let i = 0; i < walls.length; i++)
        {
            scene.remove(walls[i]);
        }
        gridMapHelper.clearObstacles();   
    }

    if(traps != undefined)
    {
        for(let i = 0; i < traps.length; i++)
        {
            scene.remove(traps[i]);
        }   
        gridMapHelper.clearTraps();
    }

    if(fires != undefined)
    {
        for(let i = 0; i < fires.length; i++)
        {
            scene.remove(fires[i]);
        }   
        gridMapHelper.clearFires();   
    }

    crystals = undefined;
    walls = undefined;
    traps = undefined;
    fires = undefined;
}

function animate()
{
    if(fires)
    {
        for(let i = 0; i < fires.length;i++)
        {
            fires[i].update(fireClock);
        }   
    }
    renderer.render(scene,camera);
    controls.update();
    requestAnimationFrame(animate);
}

window.addEventListener('resize',() => {
    resizeCanvasToDisplaySize(renderer,camera);
});

const execBtn = document.getElementById("execBtn")
execBtn.addEventListener("click",async function() {
    const codeParsed = parseCode(editor.state.doc.toString());
    if(traps != null)
        trapsDeactivation(traps)
    sceneProperties.cancelExecution = false;
    if(codeParsed != null)
    {
        resetLevel();
        sceneProperties.executing = true;
        this.disabled = true;
        await eval(codeParsed);
        if(winCondition())
        {
            readOnlyState.doc = editor.state.doc;
            editor.setState(readOnlyState);
            document.getElementById('winMessage').classList.remove('invisible');
            document.getElementById('advanceBtn').classList.remove('invisible');
            document.getElementById("resetBtn").disabled = true;
        }
        else
        {
            sceneProperties.executing = false;
            this.disabled = false;
        }
    }
});

const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click",() => {
    sceneProperties.cancelExecution = true;
    resetLevel();
});

const advanceBtn = document.getElementById('advanceBtn');
advanceBtn.addEventListener('click',(e) => {
    sceneProperties.phase++;
    if(sceneProperties.phase < phaseGeneration.length)
    {
        if(setFireStatesInterval)
        {
            clearInterval(setFireStatesInterval);
            setFireStatesInterval = undefined;
        }
        removeObjects(objectives,walls,traps,fires);
        phaseGeneration[sceneProperties.phase]();
        editor.setState(editState);
        consoleElement.innerText = null;
        document.getElementById('winMessage').classList.add('invisible');
        document.getElementById('advanceBtn').classList.add('invisible');
        execBtn.disabled = false;
        resetBtn.disabled = false;
    }
    else
    {
        sceneProperties.phase = sceneProperties.phase > phaseGeneration.length ? phaseGeneration.length : sceneProperties.phase;
        window.location.href = "../";
    }
});

//Running level 2
resizeCanvasToDisplaySize(renderer,camera);
phaseGeneration[sceneProperties.phase]();
displayExtinguisherUses();
animate();