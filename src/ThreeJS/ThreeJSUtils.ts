import * as THREE from "three";

class ThreeJSUtils {
  static readonly UP: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  static CreateSphere(radius?: number, color?: THREE.ColorRepresentation) {
    const geometry = new THREE.SphereGeometry(radius || 0.1);
    const material = new THREE.MeshBasicMaterial({ color: color || 0xff0000 });

    return new THREE.Mesh(geometry, material);
  }
}

export default ThreeJSUtils;
