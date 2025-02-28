import Planet from "./Planet";
import * as THREE from "three";
import ThreeJSUtils from "./ThreeJSUtils";
import { Util } from "../Util";

interface SatelliteData {
  mesh: THREE.Mesh;
  orbitQuaternion: THREE.Quaternion;
  offset: number;
  radius: number;
  speed: number;
}

class Atmosphere {
  private scene: THREE.Scene;

  private planet: Planet;
  private satellites: SatelliteData[] = [];
  constructor(scene: THREE.Scene, planet: Planet) {
    this.scene = scene;
    this.planet = planet;

    for (let i = 0; i < 5; i++) {
      const newSatelliteData: SatelliteData = {
        mesh: ThreeJSUtils.CreateSphere(),
        orbitQuaternion: new THREE.Quaternion().setFromUnitVectors(
          ThreeJSUtils.UP,
          new THREE.Vector3().randomDirection()
        ),
        offset: Math.random() * Math.PI * 2,
        radius:
          this.planet.getRadius() +
          Util.mapRange(Math.random(), 0, 1, 0.1, 0.4),
        speed: Util.mapRange(Math.random(), 0, 1, 0.3, 1),
      };
      this.scene.add(newSatelliteData.mesh);
      this.satellites.push(newSatelliteData);
    }
  }

  private updateSatellitePos(
    satelliteData: SatelliteData,
    elapsedTime: number
  ) {
    const p = new THREE.Vector3(satelliteData.radius, 0, 0);

    const rotQuat = new THREE.Quaternion().setFromAxisAngle(
      ThreeJSUtils.UP,
      (elapsedTime + satelliteData.offset) * satelliteData.speed
    );

    const tiltQuat = new THREE.Quaternion().setFromUnitVectors(
      ThreeJSUtils.UP,
      satelliteData.orbitQuaternion
    );

    p.applyQuaternion(tiltQuat.multiply(rotQuat));
    satelliteData.mesh.position.copy(p);
  }

  update(elapsedTime: number, deltaTime: number, binValues: number[]) {
    this.satellites.forEach((satellite, i) => {
      this.updateSatellitePos(satellite, elapsedTime);
      const scale = Util.mapRange(binValues[i], 0, 1, 0.5, 4);
      satellite.mesh.scale.set(scale, scale, scale);
    });
  }
}

export default Atmosphere;
