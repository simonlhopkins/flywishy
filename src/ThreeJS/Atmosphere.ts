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
  fromColor: THREE.Color;
  toColor: THREE.Color;
}

class Atmosphere {
  private scene: THREE.Scene;

  private planet: Planet;
  private satellites: SatelliteData[] = [];
  constructor(scene: THREE.Scene, planet: Planet) {
    this.scene = scene;
    this.planet = planet;
    const colors = [0xe8c53a, 0x3a609a, 0x00cda8, 0xf55545, 0xcb1059];
    for (let i = 0; i < 10; i++) {
      const newSatelliteData: SatelliteData = {
        mesh: this.createSatellite(),
        orbitQuaternion: new THREE.Quaternion().setFromUnitVectors(
          ThreeJSUtils.UP,
          new THREE.Vector3().randomDirection()
        ),
        offset: Math.random() * Math.PI * 2,
        radius:
          this.planet.getRadius() + Util.mapRange(Math.random(), 0, 1, 0.4, 1),
        speed: Util.mapRange(Math.random(), 0, 1, 0.3, 1),
        fromColor: new THREE.Color().setHex(
          Util.getRandomElement(colors) as number
        ),
        toColor: new THREE.Color().setHex(
          Util.getRandomElement(colors) as number
        ),
      };
      this.scene.add(newSatelliteData.mesh);
      this.satellites.push(newSatelliteData);
    }
  }

  private createSatellite() {
    const geometry = new THREE.SphereGeometry(0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    return new THREE.Mesh(geometry, material);
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
  private getRandomPastelColor() {
    // Random hue between 0 and 360 degrees
    const hue = Math.random() * 360;

    // Set saturation and lightness for pastel colors
    const saturation = Math.random() * 0.2 + 0.4; // Saturation between 40% and 60%
    const lightness = Math.random() * 0.4 + 0.6; // Lightness between 60% and 100%

    // Convert HSL to RGB using Three.js Color
    const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

    return color;
  }

  private getRandomVibrantColor(): THREE.Color {
    // Random hue between 0 and 360 degrees
    const hue = Math.random() * 360;

    // High saturation (between 80% and 100%) for vibrancy
    const saturation = Math.random() * 0.2 + 0.8; // Saturation between 80% and 100%

    // Medium lightness (between 40% and 60%) for vibrancy
    const lightness = Math.random() * 0.2 + 0.4; // Lightness between 40% and 60%

    // Convert HSL to RGB using Three.js Color
    const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);

    return color;
  }

  update(elapsedTime: number, deltaTime: number, binValues: number[]) {
    this.satellites.forEach((satellite, i) => {
      this.updateSatellitePos(satellite, elapsedTime);
      const scaleAmount = THREE.MathUtils.smoothstep(binValues[i % 5], 0, 1);
      const scale = Util.mapRange(scaleAmount, 0, 1, 1, 3);
      satellite.mesh.scale.set(scale, scale, scale);
      const material = satellite.mesh.material as THREE.MeshBasicMaterial;
      const color = satellite.fromColor
        .clone()
        .lerp(satellite.toColor, scaleAmount);
      material.color.setHex(color.getHex());
    });
  }
}

export default Atmosphere;
