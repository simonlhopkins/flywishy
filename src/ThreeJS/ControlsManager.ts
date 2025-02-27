import CameraControls from "camera-controls";
import * as THREE from "three";
import Planet from "./Planet";
import { Util } from "../Util";

class ControlsManager {
  private planet: Planet;
  private controls: CameraControls;
  private camera: THREE.PerspectiveCamera;

  constructor(
    planet: Planet,
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement
  ) {
    this.planet = planet;
    this.camera = camera;
    this.camera.position.z = 3;
    CameraControls.install({ THREE: THREE });
    this.controls = new CameraControls(camera, domElement);
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minDistance = 0.3;
    this.controls.maxDistance = 10;

    this.controls.rotateTo(0.5022233669230078, 0.7739323347923857);
  }

  public GetZoomLevel() {
    return Util.mapRange(
      this.controls.distance,
      this.controls.minDistance,
      this.controls.maxDistance,
      0,
      1
    );
  }
  update(_elapsedTime: number, deltaTime: number) {
    const planeQuaternion = this.planet.getPlaneQuaternion();
    const planePosition = this.planet.getPlanePos()!;

    this.controls.update(deltaTime);
    this.camera.position.applyQuaternion(planeQuaternion).add(planePosition);
    this.camera.quaternion.premultiply(planeQuaternion);
    // console.log(this.controls.azimuthAngle, this.controls.polarAngle);
  }
}

export default ControlsManager;
