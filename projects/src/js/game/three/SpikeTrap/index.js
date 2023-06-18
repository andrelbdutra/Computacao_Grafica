import * as THREE from 'three';

let alpha2 = 0.1

class TrapBox extends THREE.Mesh {
    constructor() { 
        super(new THREE.BoxGeometry(2, 2, 2, 16, 16), new THREE.MeshLambertMaterial({color:"black"}));
    }
};

class SpikeHole extends THREE.Mesh {
    constructor() { 
        super(new THREE.CylinderGeometry(0.15, 0.15, 0.001, 16, 4), new THREE.MeshLambertMaterial({color:"black"}));
    }
};

class HoleTorus extends THREE.Mesh {
    constructor() { 
        super(new THREE.TorusGeometry(0.15, 0.05 , 10, 20), new THREE.MeshPhongMaterial({color:"gray"})); 
    }
};

class Spike extends THREE.Mesh {
    constructor() { 
        super(new THREE.ConeGeometry(0.10, 2, 16, 16), new THREE.MeshStandardMaterial({
            color:"white", 
            roughness: 0.008, 
            metalness:0.5,
            envMap: null, 
            envMapIntensity: 0.78
        })); 
    }
};

export class SpikeTrap extends THREE.Object3D {  
   constructor(){
        super();
        this.index = 0
        this.x = 0
        this.z = 0
        this.active = true
        this.requestID = null
        this.alpha = 0.01

        // Trap Box
        let trapBox = new TrapBox()
        trapBox.position.set(0,-1.01,0)

        // Spike holes
        let spikeHole1 = new SpikeHole;
        spikeHole1.position.set(0, 0, 0)
        let spikeHole2 = new SpikeHole;
        spikeHole2.position.set(0.5, 0, 0.5)
        let spikeHole3 = new SpikeHole;
        spikeHole3.position.set(0.5, 0, -0.5)
        let spikeHole4 = new SpikeHole;
        spikeHole4.position.set(-0.5, 0, 0.5)
        let spikeHole5 = new SpikeHole;
        spikeHole5.position.set(-0.5, 0, -0.5)

        // Hole Torus
        let holeTorus1 = new HoleTorus;
        holeTorus1.position.set(0, 0, 0)
        holeTorus1.rotateX(Math.PI/2)
        let holeTorus2 = new HoleTorus;
        holeTorus2.position.set(0.5, 0, 0.5)
        holeTorus2.rotateX(Math.PI/2)
        let holeTorus3 = new HoleTorus;
        holeTorus3.position.set(0.5, 0, -0.5)
        holeTorus3.rotateX(Math.PI/2)
        let holeTorus4 = new HoleTorus;
        holeTorus4.position.set(-0.5, 0, 0.5)
        holeTorus4.rotateX(Math.PI/2)
        let holeTorus5 = new HoleTorus;
        holeTorus5.position.set(-0.5, 0, -0.5)
        holeTorus5.rotateX(Math.PI/2)

        // Spikes
        let spike1 = new Spike;
        spike1.position.set(0, 1, 0)
        let spike2 = new Spike;
        spike2.position.set(0.5, 1, 0.5)
        let spike3 = new Spike;
        spike3.position.set(0.5, 1, -0.5)
        let spike4 = new Spike;
        spike4.position.set(-0.5, 1, 0.5)
        let spike5 = new Spike;
        spike5.position.set(-0.5, 1, -0.5)
        this.spikes = [spike1, spike2, spike3, spike4, spike5]
        
        this.add(trapBox);
        this.add(spikeHole1);
        this.add(spikeHole2);
        this.add(spikeHole3);
        this.add(spikeHole4);
        this.add(spikeHole5);
        this.add(holeTorus1);
        this.add(holeTorus2);
        this.add(holeTorus3);
        this.add(holeTorus4);
        this.add(holeTorus5);
        this.add(spike1);
        this.add(spike2);
        this.add(spike3);
        this.add(spike4);
        this.add(spike5);
        
        return this;
   }
   
   positionAlmostEqual(positionA, finalPosition)
   {
        console.log(positionA.toFixed(1))
       if(positionA.toFixed(1) == finalPosition)
       {
           return true;
       }
       else
       {
           return false;
       }
   }

   deactivate(){
        if(this.spikes[0].position.y.toFixed(1) > -1)
        {
            console.log(this.spikes[0].position.y.toFixed(1))
            this.spikes[0].position.lerp(new THREE.Vector3(0, -1, 0), this.alpha)
            requestID = requestAnimationFrame(this.deactivate);
        }
        else
        {
            cancelAnimationFrame(requestID);
        }
   }
}

export function trapsActivation(traps){
    for(let i = 0; i < traps.length; i++){
    activateTrap()
        function activateTrap(){
            if(traps[i].spikes[4].position.y.toFixed(1) < 1)
            {
                cancelAnimationFrame(traps[i].requestID);
                alpha2 += 0.01;
                traps[i].active = true;
                traps[i].spikes.forEach(spike => spike.position.lerp(new THREE.Vector3(spike.position.x, 1, spike.position.z), alpha2))
                traps[i].requestID = requestAnimationFrame(activateTrap);
            }
            else
            {
                cancelAnimationFrame(traps[i].requestID);
                alpha2 = 0.01
            }
        }
    }
}

export function trapsDeactivation(traps){
    for(let i = 0; i < traps.length; i++){
    deactivateTrap()
        function deactivateTrap(){
            if(traps[i].spikes[4].position.y.toFixed(1) > -1)
            {
                cancelAnimationFrame(traps[i].requestID);
                alpha2 += 0.001;
                traps[i].active = false;
                traps[i].spikes.forEach(spike => spike.position.lerp(new THREE.Vector3(spike.position.x, -1, spike.position.z), alpha2))
                traps[i].requestID = requestAnimationFrame(deactivateTrap);
            }
            else
            {
                cancelAnimationFrame(traps[i].requestID);
                alpha2 = 0.01
            }
        }
    }
}

