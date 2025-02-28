import CameraControls from "camera-controls";
import * as THREE from "three";
import Planet from "./Planet";
import { Util } from "../Util";
import TweenManager from "./TweenManager";
import { Easing, Tween } from "@tweenjs/tween.js";

export interface IControlsManager {
  lookAtPlane(): void;
  lookAtGlobe(): void;
}

class ControlsManager implements IControlsManager {
  private planet: Planet;
  private controls: CameraControls;
  private camera: THREE.PerspectiveCamera;
  private tweenManager: TweenManager;
  private lookAtPlanePercent = { value: 1 };
  private globeQuat: THREE.Quaternion = new THREE.Quaternion();

  constructor(
    planet: Planet,
    camera: THREE.PerspectiveCamera,
    tweenManager: TweenManager,
    domElement: HTMLElement
  ) {
    this.planet = planet;
    this.camera = camera;
    this.tweenManager = tweenManager;
    this.camera.position.z = 8;
    CameraControls.install({ THREE: THREE });
    this.controls = new CameraControls(camera, domElement);
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minDistance = 0.3;
    this.controls.maxDistance = 10;

    this.controls.rotateTo(0.5022233669230078, 0.7739323347923857);
  }

  public lookAtPlane() {
    const beginningDistance = this.controls.distance;

    this.tweenManager.add(
      new Tween(this.lookAtPlanePercent)
        .to({ value: 1 }, 1000)
        .onUpdate(() => {
          this.controls.distance = Util.mapRange(
            this.lookAtPlanePercent.value,
            0,
            1,
            beginningDistance,
            2
          );
        })
        .easing(Easing.Sinusoidal.InOut)
    );
  }
  public lookAtGlobe() {
    //todo, maybe save the plane pos and quat at this point, so it is more smooth
    this.globeQuat = this.planet.getPlaneQuaternion();
    const beginningDistance = this.controls.distance;
    this.tweenManager.add(
      new Tween(this.lookAtPlanePercent)
        .to({ value: 0 }, 1000)
        .onUpdate(() => {
          this.controls.distance = Util.mapRange(
            1 - this.lookAtPlanePercent.value,
            0,
            1,
            beginningDistance,
            10
          );
        })
        .easing(Easing.Sinusoidal.InOut)
    );
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

    const targetQuaternion = new THREE.Quaternion().slerp(
      planeQuaternion,
      this.lookAtPlanePercent.value
    );

    const targetPosition = new THREE.Vector3(0, 0, 0).lerp(
      planePosition,
      this.lookAtPlanePercent.value
    );

    this.controls.update(deltaTime);
    this.camera.position.applyQuaternion(targetQuaternion).add(targetPosition);
    this.camera.quaternion.premultiply(targetQuaternion);
  }
}

export default ControlsManager;
