//import {basicSetup} from "codemirror";
import {EditorView, keymap} from "@codemirror/view";
import {EditorState} from "@codemirror/state";
import {indentWithTab} from "@codemirror/commands";
import {
    generateDefaultSceneObjects,
    resizeCanvasToDisplaySize,
    loadDefaultActor,
    loadDefaultObjectives,
    translateActor,
    rotateActor,
    checkCollision,
    degreeToRadians
} from "../../js/game/three/util";
import GridMapHelper from "../../js/game/three/GridMapHelper";
import parseCode from "../../js/game/level1/parser";
import { displayTime, configureDataAndUpload } from "../../js/game/timer";
import { Modal } from "bootstrap";
import {SpikeTrap, trapsActivation, trapsDeactivation} from "../../js/game/three/SpikeTrap";

//Defining Level 1 Scene's Properties

const sceneProperties = {
    cancelExecution: false,
    timer: 0,
    phase: 0
}

//Generating default Level 1 Objects

const logModal = new Modal(document.getElementById("logModal"));

let timerUpadate;

function updateTime()
{
    sceneProperties.timer++;
}

const minHeightEditor = EditorView.theme({
    ".cm-content, .cm-gutter": {minHeight: "18vh"}
});

function generateDefaultEditor(refElement)
{
    const editor = new EditorView({
        doc: 'Oi',
        //lineWrapping : true,
        extensions: [keymap.of(defaultKeymap)],
        parent: document.body,
        //parent: refElement,
        extraKeys: {"Ctrl-Space": "autocomplete"}
    });

    return editor;
}

const readOnlyState = EditorState.create({
    extensions: [basicSetup,EditorView.editable.of(false)]
});

const editState = EditorState.create({
    extensions: [basicSetup,minHeightEditor,keymap.of([indentWithTab])]
});

const editor = generateDefaultEditor(document.getElementById("editorArea"), {
    lineNumbers: true,
});

const andarFrenteBtn = document.getElementById('andarFrente');
andarFrenteBtn.addEventListener("click",() => { 
    var cursor = editor.state.selection.main.head
    let transaction = editor.state.update({changes: {from: cursor, insert: "andarFrente()\n"}})
    editor.dispatch(transaction)
    editor.focus()
    let actualLine = editor.state.doc.lineAt(cursor).number
    let tamLinha = editor.state.doc.line(actualLine).text.length
    //editor.dispatch({selection:{anchor: tamLinha}})
});



const consoleElement = document.getElementById('consoleArea');

const {renderer, scene, camera, controls} = generateDefaultSceneObjects(document.getElementById("phaseView"));

const gridMapHelper = new GridMapHelper();

const plane = gridMapHelper.createGridPlane();

const actor = loadDefaultActor();

let objectives;
let walls;
let traps;

let spikeTrapState;

let setSpikeTrapState;

let setSpikeTrapStateInterval;

scene.add(plane);
scene.add(actor);

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

let coletarCristal;

let resetLevel;

let winCondition;

const phaseGeneration = [];

//Functions to create the phases

//Phase 1
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 1 - Fase 1 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar ao cristal, após isso, o colete.";

        camera.position.set(0,15,30);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(1);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        scene.add(objectives[0]);

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

        timerUpadate = setInterval(updateTime,1000);
    }
);

//Phase 2
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 1 - Fase 2 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar ao cristal, após isso, o colete.";

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(1);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),0.0,gridMapHelper.getGlobalZPositionFromCoord(2));
        scene.add(objectives[0]);

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

        timerUpadate = setInterval(updateTime,1000);
    }
);

//Phase 3
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 1 - Fase 3 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar aos cristais, após isso, os colete.";

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(2));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(2);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0.0,gridMapHelper.getGlobalZPositionFromCoord(6));
        objectives[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.0,gridMapHelper.getGlobalZPositionFromCoord(1));
        scene.add(objectives[0]);
        scene.add(objectives[1]);

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
            actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(2));
            actor.rotation.set(0,degreeToRadians(90),0);
            actor.getObjectByName('eve').rotation.set(0,0,0);
            objectives[0].visible = true;
            objectives[1].visible = true;
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

        timerUpadate = setInterval(updateTime,1000);
    }
);

//Phase 4
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 1 - Fase 4 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar ao cristal, após isso, o colete.";

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(1);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        scene.add(objectives[0]);

        walls = [];
        const boxGeometry = new THREE.BoxGeometry(2,2,2);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),1.0,gridMapHelper.getGlobalXPositionFromCoord(5));
        gridMapHelper.addObstacle(7,7,5,5);
        scene.add(walls[0]);

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

        timerUpadate = setInterval(updateTime,1000);
    }
);

//Phase 5
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 1 - Fase 5 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar aos cristais, após isso, os colete.";

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(2));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(2);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0.0,gridMapHelper.getGlobalZPositionFromCoord(2));
        objectives[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.0,gridMapHelper.getGlobalZPositionFromCoord(8));
        scene.add(objectives[0]);
        scene.add(objectives[1]);

        walls = [];
        const boxGeometry = new THREE.BoxGeometry(6,2,2);
        const boxGeometry2 = new THREE.BoxGeometry(4,2,2);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),1.0,gridMapHelper.getGlobalXPositionFromCoord(7));
        walls[1].rotateY(degreeToRadians(90));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1.0,gridMapHelper.getGlobalXPositionFromCoord(2.5));
        gridMapHelper.addObstacle(5,7,7,7);
        gridMapHelper.addObstacle(5,5,2,3);
        scene.add(walls[0]);
        scene.add(walls[1]);

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
            actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(2));
            actor.rotation.set(0,degreeToRadians(90),0);
            actor.getObjectByName('eve').rotation.set(0,0,0);
            objectives[0].visible = true;
            objectives[1].visible = true;
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

        timerUpadate = setInterval(updateTime,1000);
    }
);

//Phase 6
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 1 - Fase 6 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar ao cristal, após isso, o colete.";

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(1);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),0.0,gridMapHelper.getGlobalZPositionFromCoord(0));
        scene.add(objectives[0]);

        walls = [];
        const boxGeometry1 = new THREE.BoxGeometry(14,2,2);
        const boxGeometry2 = new THREE.BoxGeometry(16,2,2);
        const boxGeometry3 = new THREE.BoxGeometry(2,2,4);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry1,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry3,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1.0,gridMapHelper.getGlobalZPositionFromCoord(2));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(5.5),1.0,gridMapHelper.getGlobalZPositionFromCoord(4));
        walls[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),1.0,gridMapHelper.getGlobalZPositionFromCoord(0.5));
        gridMapHelper.addObstacle(2,8,2,2);
        gridMapHelper.addObstacle(2,9,4,4);
        gridMapHelper.addObstacle(7,7,0,1);
        scene.add(walls[0]);
        scene.add(walls[1]);
        scene.add(walls[2]);

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

        timerUpadate = setInterval(updateTime,1000);
    }
);

//Phase 7
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 1 - Fase 7 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar ao cristal, após isso, o colete.";

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(1);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.0,gridMapHelper.getGlobalZPositionFromCoord(0));
        scene.add(objectives[0]);

        walls = [];
        const boxGeometry1 = new THREE.BoxGeometry(14,2,2);
        const boxGeometry2 = new THREE.BoxGeometry(16,2,2);
        const boxGeometry3 = new THREE.BoxGeometry(2,2,8);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry1,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry3,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry1,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1.0,gridMapHelper.getGlobalZPositionFromCoord(4));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(5.5),1.0,gridMapHelper.getGlobalZPositionFromCoord(8));
        walls[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),1.0,gridMapHelper.getGlobalZPositionFromCoord(1.5));
        walls[3].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1.0,gridMapHelper.getGlobalZPositionFromCoord(6));
        gridMapHelper.addObstacle(2,8,4,4);
        gridMapHelper.addObstacle(2,8,6,6);
        gridMapHelper.addObstacle(8,8,0,3);
        gridMapHelper.addObstacle(2,9,8,8);
        scene.add(walls[0]);
        scene.add(walls[1]);
        scene.add(walls[2]);
        scene.add(walls[3]);

        traps = [];
        traps.push(new SpikeTrap());
        traps[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(8),0,gridMapHelper.getGlobalZPositionFromCoord(5));
        gridMapHelper.addTrap(8,5,traps[0]);
        scene.add(traps[0]);

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

        timerUpadate = setInterval(updateTime,1000);
    }
);

//Phase 8
phaseGeneration.push(
    () => {
        document.getElementById('phaseTitle').innerText = "Nível 1 - Fase 8 de 8";
        document.getElementById('phaseObjective').innerText = "Faça o robô chegar aos cristais, após isso, os colete.";

        camera.position.set(0,15,30);
        camera.rotation.set(0,0,0);

        actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(2));
        actor.rotation.set(0,degreeToRadians(90),0);

        objectives = loadDefaultObjectives(3);
        objectives[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0.0,gridMapHelper.getGlobalZPositionFromCoord(2));
        objectives[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.0,gridMapHelper.getGlobalZPositionFromCoord(8));
        objectives[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0.0,gridMapHelper.getGlobalZPositionFromCoord(5));
        scene.add(objectives[0]);
        scene.add(objectives[1]);
        scene.add(objectives[2]);

        walls = [];
        const boxGeometry = new THREE.BoxGeometry(6,2,2);
        const boxGeometry2 = new THREE.BoxGeometry(4,2,2);
        const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"});
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry2,boxMaterial));
        walls.push(new THREE.Mesh(boxGeometry,boxMaterial));
        walls[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),1.0,gridMapHelper.getGlobalXPositionFromCoord(7));
        walls[1].rotateY(degreeToRadians(90));
        walls[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1.0,gridMapHelper.getGlobalZPositionFromCoord(2.5));
        walls[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1.0,gridMapHelper.getGlobalZPositionFromCoord(4));
        gridMapHelper.addObstacle(5,7,7,7);
        gridMapHelper.addObstacle(5,5,2,3);
        gridMapHelper.addObstacle(1,3,4,4);
        scene.add(walls[0]);
        scene.add(walls[1]);
        scene.add(walls[2]);

        traps = [];
        traps.push(new SpikeTrap());
        traps.push(new SpikeTrap());
        traps.push(new SpikeTrap());
        traps[0].position.set(gridMapHelper.getGlobalXPositionFromCoord(1),0,gridMapHelper.getGlobalZPositionFromCoord(5));
        traps[1].position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0,gridMapHelper.getGlobalZPositionFromCoord(3));
        traps[2].position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0,gridMapHelper.getGlobalZPositionFromCoord(8));
        gridMapHelper.addTrap(1,5,traps[0]);
        gridMapHelper.addTrap(6,3,traps[1]);
        gridMapHelper.addTrap(5,8,traps[2]);
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
            actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(2));
            actor.rotation.set(0,degreeToRadians(90),0);
            actor.getObjectByName('eve').rotation.set(0,0,0);
            objectives[0].visible = true;
            objectives[1].visible = true;
            objectives[2].visible = true;
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

        document.getElementById('winMessage').innerText = "Nível Concluído";
        document.getElementById('advanceBtn').innerText = "Finalizar";

        timerUpadate = setInterval(updateTime,1000);
    }
);

//Defining function that remove objects, scene render and button's functions

function removeObjects(crystals, walls, traps)
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

    crystals = undefined;
    walls = undefined;
    traps = undefined;
}

function animate()
{
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camera);
    displayTime(sceneProperties.timer,document.getElementById("timer"));
}

window.addEventListener('resize',() => {
    resizeCanvasToDisplaySize(renderer,camera);
});

const finishEarlierButton = document.getElementById('finishEarlier');

const execBtn = document.getElementById("execBtn")
execBtn.addEventListener("click",async function() {
    const codeParsed = parseCode(editor.state.doc.toString());
    sceneProperties.cancelExecution = false;
    if(traps != null)
        trapsDeactivation(traps)
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
            finishEarlierButton.disabled = true;
            clearInterval(timerUpadate);
            if(sceneProperties.phase == phaseGeneration.length - 1)
            {
                configureDataAndUpload(document.getElementById("name"),document.getElementById("age"),'gender','prog-exp',document.getElementById("subBtn"),sceneProperties.timer,'../','Nível 1/Completo');
            }
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
        removeObjects(objectives,walls,traps);
        phaseGeneration[sceneProperties.phase]();
        editor.setState(editState);
        consoleElement.innerText = null;
        document.getElementById('winMessage').classList.add('invisible');
        document.getElementById('advanceBtn').classList.add('invisible');
        execBtn.disabled = false;
        resetBtn.disabled = false;
        finishEarlierButton.disabled = false;
    }
    else
    {
        sceneProperties.phase = sceneProperties.phase > phaseGeneration.length ? phaseGeneration.length : sceneProperties.phase;
        logModal.show();
    }
});

finishEarlierButton.addEventListener('click', (e) => {
    if(confirm("Deseja realmente finalizar a prática?"))
    {
        clearInterval(timerUpadate);
        configureDataAndUpload(document.getElementById("name"),document.getElementById("age"),'gender','prog-exp',document.getElementById("subBtn"),sceneProperties.timer,'../',`Nível 1/Fase ${sceneProperties.phase + 1}`);
        logModal.show();
    }
});

//Running level 1

resizeCanvasToDisplaySize(renderer,camera);
phaseGeneration[sceneProperties.phase]();
animate();