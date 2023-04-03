
import * as THREE from 'three';

class Fence extends THREE.Mesh {
    constructor() { 
        super(new THREE.BoxGeometry(0.5, 2, 0.3), new THREE.MeshLambertMaterial({color:"gray"}));
    }
};

class FenceTorus extends THREE.Mesh {
    constructor() { 
        super(new THREE.TorusGeometry(0.15, 0.05 , 10, 20), new THREE.MeshLambertMaterial({color:"gray"})); 
    }
};

class FenceBase extends THREE.Mesh {
    constructor() { 
        super(new THREE.BoxGeometry(0.5, 2, 0.1), new THREE.MeshLambertMaterial({color:"gray"}));
    }
};

class Laser extends THREE.Mesh {
    constructor(color) { 
        super(new THREE.CylinderGeometry(0.1, 0.1, 2, 64, 64), new THREE.MeshLambertMaterial({emissive:color, color:color, emissiveIntensity:1, transparent:true, opacity: 0.7}));
    }
};

class LaserFence extends THREE.Object3D {  
   constructor(){
        super();
        this.index = 0
        this.x = 0
        this.z = 0
        this.state = "red"
        this.active = true

        // fence base
        let fenceBase = new FenceBase;
        fenceBase.rotateX(-Math.PI / 2)
        fenceBase.position.set(0, -0.95, 0)
        
        // fences
        let laserFence1 = new Fence;
        laserFence1.position.set(0, 0, -1)
        laserFence1.castShadow = true;
        let laserFence2 = new Fence;
        laserFence2.position.set(0, 0, 1)
        laserFence2.castShadow = true;

        // fence torus
        let fenceTorus1A = new FenceTorus;
        fenceTorus1A.position.set(0, 0.6, 0.85);
        let fenceTorus1B = new FenceTorus;
        fenceTorus1B.position.set(0, 0.6, -0.85);
        let fenceTorus2A = new FenceTorus;
        fenceTorus2A.position.set(0, 0, 0.85);
        let fenceTorus2B = new FenceTorus;
        fenceTorus2B.position.set(0, 0, -0.85);
        let fenceTorus3A = new FenceTorus;
        fenceTorus3A.position.set(0, -0.6, 0.85);
        let fenceTorus3B = new FenceTorus;
        fenceTorus3B.position.set(0, -0.6, -0.85);


        // blue lasers
        let laserBlue1 = new Laser("blue")
        laserBlue1.rotateX(-Math.PI / 2);
        laserBlue1.position.set(0, 0.6, 0)
        let laserBlue2 = new Laser("blue")
        laserBlue2.rotateX(-Math.PI / 2);
        laserBlue2.position.set(0, 0, 0)
        let laserBlue3 = new Laser("blue")
        laserBlue3.rotateX(-Math.PI / 2);
        laserBlue3.position.set(0, -0.6, 0)
        this.blueLasers = [laserBlue1, laserBlue2, laserBlue3]
        this.blueLasers.forEach(laser => {laser.visible = false;
                                         laser.castShadow = true;
                                        laser.emisissive = "blue";})

        // red lasers
        let laserRed1 = new Laser("red")
        laserRed1.rotateX(-Math.PI / 2);
        laserRed1.position.set(0, 0.6, 0)
        let laserRed2 = new Laser("red")
        laserRed2.rotateX(-Math.PI / 2);
        laserRed2.position.set(0, 0, 0)
        let laserRed3 = new Laser("red")
        laserRed3.rotateX(-Math.PI / 2);
        laserRed3.position.set(0, -0.6, 0)
        this.redLasers =[laserRed1, laserRed2, laserRed3]
        this.redLasers.forEach(laser => laser.castShadow = true)
        
        this.add(fenceBase);
        this.add(laserFence1);
        this.add(laserFence2);
        this.add(fenceTorus1A);
        this.add(fenceTorus1B);
        this.add(fenceTorus2A);
        this.add(fenceTorus2B);
        this.add(fenceTorus3A);
        this.add(fenceTorus3B);
        this.add(laserBlue1);
        this.add(laserBlue2);
        this.add(laserBlue3);      
        this.add(laserRed1);
        this.add(laserRed2);
        this.add(laserRed3);
        return this;
   }

   setVisible()
   {
        this.active = true
   }

   setNotVisible(){
        this.blueLasers.forEach(laser => laser.visible = false)
        this.redLasers.forEach(laser => laser.visible = false)
        this.active = false
   }

   setBlue(){
        if(this.active == true){
            this.blueLasers.forEach(laser => laser.visible = true)
            this.redLasers.forEach(laser => laser.visible = false)
            this.state = 'blue'
        }
   }

   setRed(){
        if(this.active == true){
            this.blueLasers.forEach(laser => laser.visible = false)
            this.redLasers.forEach(laser => laser.visible = true)
            this.state = 'red'
        }
   }
}

export default LaserFence;

