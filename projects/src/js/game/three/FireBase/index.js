
import * as THREE from 'three';
import Fire from './Fire';
import { CSG } from './CSGMesh'

class FireBase extends THREE.Object3D {  

   constructor(){
      super();
      
      // Load Textures
      const firePath = new URL('../../../../assets/textures/fire.png',import.meta.url).toString();
      const stonePath = new URL('../../../../assets/textures/stone.jpg',import.meta.url).toString();
      let textureLoader = new THREE.TextureLoader();
      let fireTex     = textureLoader.load(firePath);
      let cylinderTex = textureLoader.load(stonePath);
      let ringTex     = textureLoader.load(stonePath); 
      
      // Config Textures
      this.setFilters(fireTex, cylinderTex, ringTex);
      cylinderTex.repeat.set(5, 0.1);
      ringTex.repeat.set(1.3, 1.3);         

      // External cylinder --------------------------------------------------------------------
      let ch = 0.15; // CylinderHeight
      const cylinderMesh1 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, ch, 32))
      const cylinderMesh2 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, ch, 32))     
      const cylinderCSG1 = CSG.fromMesh(cylinderMesh1)
      const cylinderCSG2 = CSG.fromMesh(cylinderMesh2)
      const cylindersSubtractCSG = cylinderCSG1.subtract(cylinderCSG2)
      const cylindersSubtractMesh = CSG.toMesh(cylindersSubtractCSG, new THREE.Matrix4())       
         cylindersSubtractMesh.material.map = cylinderTex;         

      // Cylinder top cover -------------------------------------------------------------------
      const geometry = new THREE.RingGeometry( 0.8, 1.0, 64 );
      const material = new THREE.MeshBasicMaterial( );
      const cover = new THREE.Mesh( geometry, material );
         cover.rotateX(-Math.PI / 2);
         cover.position.y += ch/2 + 0.001;
         cover.material.map = ringTex;

      // Internal cylinder --------------------------------------------------------------------      
      let ch2 = ch + 0.05; // CylinderHeight
      const cylinderMesh3 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, ch2, 32))
      const cylinderMesh4 = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.7, ch2, 32))
      const cylinderCSG3 = CSG.fromMesh(cylinderMesh3)
      const cylinderCSG4 = CSG.fromMesh(cylinderMesh4)
      const cylindersSubtractCSG1 = cylinderCSG3.subtract(cylinderCSG4)
      const cylindersSubtractMesh1 = CSG.toMesh(cylindersSubtractCSG1, new THREE.Matrix4())
         cylindersSubtractMesh1.material = new THREE.MeshLambertMaterial({ color: 'darkgray' })

      // The fire itself ----------------------------------------------------------------------
      this.fire = new Fire(fireTex);
      this.fire.scale.set(0.9, 3.0, 0.9);
      this.fire.position.set(0, 1.2, 0);

      this.add(this.fire);
      this.add(cover);
      this.add(cylindersSubtractMesh);
      this.add(cylindersSubtractMesh1);
      return this;
   }
 
   setFilters(t1, t2, t3)
   {
      t1.wrapS = t2.wrapS = t3.wrapS = THREE.RepeatWrapping;
      t1.wrapT = t2.wrapT = t3.wrapT = THREE.RepeatWrapping;      
      t1.minFilter = t2.minFilter = t3.minFilter = THREE.LinearFilter; 
      t1.magFilter = t2.magFilter = t3.magFilter = THREE.LinearFilter;       
   }

   update(clock) {
      this.fire.update(clock);
    }

   setFireVisibility(visibility)
   {
      this.fire.visible = visibility
   }
}

export default FireBase;

