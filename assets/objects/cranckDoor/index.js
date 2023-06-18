
import * as THREE from 'three';

class Fence extends THREE.Mesh {
    constructor(width = 0.5, height = 2, depth = 0.15) { 
        super(new THREE.BoxGeometry(width, height, depth), new THREE.MeshPhongMaterial({color:"white"}));
    }
};

class CranckTorus extends THREE.Mesh {
    constructor() { 
        super(new THREE.TorusGeometry(0.22, 0.05 , 10, 20), new THREE.MeshPhongMaterial({color:"red"})); 
    }
};

class CranckCylinder extends THREE.Mesh {
    constructor(radTop = 0.02, radBot = 0.02, height = 0.2, radSeg = 12, HeigSeg = 12, color = "red") { 
        super(new THREE.CylinderGeometry(radTop, radBot, height, radSeg, HeigSeg), new THREE.MeshPhongMaterial({color:color})); 
    }
};

class DoorBase extends THREE.Mesh {
    constructor(color = "white", width = 0.15, height = 2,  depth = 0.1) { 
        super(new THREE.BoxGeometry(width, height, depth), new THREE.MeshLambertMaterial({color: color}));
    }
};

class Door extends THREE.Mesh {
    constructor(color) { 
        super(new THREE.BoxGeometry(0.2, 1.9, 2), new THREE.MeshPhongMaterial({color:"lightgray"}));
    }
};



class Cranck extends THREE.Object3D {  
    constructor(type){
         super();
         this.index = 0
         this.x = 0
         this.z = 0
         this.state = type
         this.active = true
         this.type = type;
 
         // cranck torus
         let cranckTorus = new CranckTorus;
         cranckTorus.position.set(0,0,0)

         // cranck cylinders
         let CranckCylinder1 = new CranckCylinder;
         CranckCylinder1.position.set(0,0.08,0)
         let CranckCylinder2 = new CranckCylinder;
         CranckCylinder2.rotateZ(Math.PI/3.5)
         CranckCylinder2.position.set(0.08,-0.05,0)
         let CranckCylinder3 = new CranckCylinder;
         CranckCylinder3.rotateZ(Math.PI/-3.5)
         CranckCylinder3.position.set(-0.08,-0.05,0)
         let CranckCylinder4 = new CranckCylinder(0.05,0.05, 0.06, 12, 12, "red");
         CranckCylinder4.rotateX(Math.PI/2)
         CranckCylinder4.position.set(0,0,0)
         let CranckCylinder5 = new CranckCylinder(0.035,0.035, 0.061, 12, 12, "lightgray");
         CranckCylinder5.rotateX(Math.PI/2)
         CranckCylinder5.position.set(0,0,0)
         let CranckCylinder6 = new CranckCylinder(0.028,0.028, 0.075, 6, 12, "gray");
         CranckCylinder6.rotateX(Math.PI/2)
         CranckCylinder6.position.set(0,0,0)
         let CranckCylinder7 = new CranckCylinder(0.02,0.035, 0.2, 12, 12, "gray");
         CranckCylinder7.rotateX(Math.PI/2)
         CranckCylinder7.position.set(0,0,-0.1)
         let CranckCylinder8 = new CranckCylinder(0.05,0.05, 0.07, 6, 12, "gray");
         CranckCylinder8.rotateX(Math.PI/2)
         CranckCylinder8.position.set(0,0,-0.2)
 
         this.add(cranckTorus);
         this.add(CranckCylinder1);
         this.add(CranckCylinder2);
         this.add(CranckCylinder3);
         this.add(CranckCylinder4);
         this.add(CranckCylinder5);
         this.add(CranckCylinder6);
         this.add(CranckCylinder7);
         this.add(CranckCylinder8);
 
         return this;
    }
 }

class CranckDoor extends THREE.Object3D {  
   constructor(type){
        super();
        this.index = 0
        this.x = 0
        this.z = 0
        this.state = type
        this.active = true
        this.type = type;

        // door base
        let doorBase1 = new DoorBase;
        doorBase1.rotateX(-Math.PI / 2)
        doorBase1.position.set(0.175, -0.95, 0)

        let doorBase2 = new DoorBase;
        doorBase2.rotateX(-Math.PI / 2)
        doorBase2.position.set(-0.175, -0.95, 0)

        let doorBase3 = new DoorBase("black", 0.2, 2, 0.01);
        doorBase3.rotateX(-Math.PI / 2)
        doorBase3.position.set(0, -0.95, 0)
        
        // door
        let door = new Door
        door.position.set(0,0,0)
        this.doorY = door.position.y
        this.doors = [door]
        
        // fences
        let doorFence1 = new Fence(0.5, 2, 0.1);
        doorFence1.position.set(0, 0, -0.98)
        
        let doorFence2 = new Fence(0.5, 2, 0.1);
        doorFence2.position.set(0, 0, 0.98)
        
        let doorFence3 = new Fence(0.15, 2, 0.1);
        doorFence3.position.set(0.175, 0, 0.92)

        let doorFence4 = new Fence(0.15, 2, 0.1);
        doorFence4.position.set(-0.175, 0, 0.92)

        let doorFence5 = new Fence(0.15, 2, 0.1);
        doorFence5.position.set(0.175, 0, -0.92)

        let doorFence6 = new Fence(0.15, 2, 0.1);
        doorFence6.position.set(-0.175, 0, -0.92)

        // cranck torus
        let cranck = new Cranck;
        cranck.position.set(-0.7, 0, -0.8)
        this.crancks = [cranck]


        this.add(doorBase1);
        this.add(doorBase2);
        this.add(doorBase3);
        this.add(door);
        this.add(doorFence1);
        this.add(doorFence2);
        this.add(doorFence3);
        this.add(doorFence4);
        this.add(doorFence5);
        this.add(doorFence6);
        this.add(cranck);

        return this;
   }

   setVisible()
   {
        this.cranckDoors.forEach(door => door.visible = true)
        this.active = true
   }

   setNotVisible(){
        this.cranckDoors.forEach(door => door.visible = false)
        this.active = false
   }
   rotateCranckZ(angle){
    this.crancks.forEach(cranck => cranck.rotateZ(angle))
   }
   lerpDoor(mode, height){
    if(mode == 0)    
        this.doors.forEach(door => door.position.lerp(new THREE.Vector3(door.position.x, height, door.position.z), 0.03))
    else 
        this.doors.forEach(door => door.position.lerp(new THREE.Vector3(door.position.x, height, door.position.z), 0.03))
   }
   getDoorY(){
        return this.doors[0].position.y
   }
}

export default CranckDoor;

