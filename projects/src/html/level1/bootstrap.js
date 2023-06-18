import * as bootstrap from "bootstrap";

const collpaseFunctions = document.getElementById('collapseFunctions');
const collapseBtn = document.getElementById('collapseBtn');
collpaseFunctions.addEventListener('show.bs.collapse',(e) =>{
    collapseBtn.innerText = "Fechar";
});
collpaseFunctions.addEventListener('hide.bs.collapse',(e) =>{
    collapseBtn.innerText = "Abrir";
});

const consoleElement = document.getElementById('consoleArea');
const clearBtn = document.getElementById('clsConsole');
clearBtn.addEventListener('click',() =>{
    consoleElement.innerText = null;
});