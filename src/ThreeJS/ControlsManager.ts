import CameraControls from "camera-controls";
import * as THREE from "three";
import Planet from "./Planet";
import { Util } from "../Util";
import TweenManager from "./TweenManager";
import { Easing, Tween } from "@tweenjs/tween.js";

export interface IControlsManager {
  lookAtPlane(): Promise<void>;
  lookAtGlobe(): Promise<void>;
}

class ControlsManager implements IControlsManager {
  private planet: Planet;
  private controls: CameraControls;
  private camera: THREE.PerspectiveCamera;
  private tweenManager: TweenManager;
  private lookAtPlanePercent = { value: 1 };
  private globeQuat: THREE.Quaternion = new THREE.Quaternion();
  private disableAutoRotate = false;

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
    this.controls.mouseButtons.right = CameraControls.ACTION.NONE;
    this.controls.touches.two = CameraControls.ACTION.TOUCH_DOLLY;
    this.controls.touches.three = CameraControls.ACTION.NONE;
    this.controls.rotateTo(0.5022233669230078, 0.7739323347923857);
    this.initControlsEventListeners();
    this.lookAtPlane();
  }

  private initControlsEventListeners() {
    let userDragging = false;

    const onRest = () => {
      this.controls.removeEventListener("rest", onRest);
      userDragging = false;
      this.disableAutoRotate = false;
    };

    this.controls.addEventListener("controlstart", () => {
      this.controls.removeEventListener("rest", onRest);
      userDragging = true;
      this.disableAutoRotate = true;
    });
    this.controls.addEventListener("controlend", () => {
      if (this.controls.active) {
        this.controls.addEventListener("rest", onRest);
      } else {
        onRest();
      }
    });

    //
    this.controls.addEventListener("transitionstart", () => {
      if (userDragging) return;

      this.disableAutoRotate = true;
      this.controls.addEventListener("rest", onRest);
    });
  }

  public lookAtPlane() {
    const beginningDistance = this.controls.distance;
    const targetZoom = 1.2;
    return new Promise<void>((res) => {
      this.tweenManager.add(
        new Tween(this.lookAtPlanePercent)
          .to({ value: 1 }, 1000)
          .onUpdate(() => {
            this.controls.distance = Util.mapRange(
              this.lookAtPlanePercent.value,
              0,
              1,
              beginningDistance,
              targetZoom
            );
          })
          .easing(Easing.Sinusoidal.InOut)
          .onComplete(() => {
            res();
          })
      );
    });
  }
  public lookAtGlobe() {
    //todo, maybe save the plane pos and quat at this point, so it is more smooth
    this.globeQuat = this.planet.getPlaneQuaternion();
    const beginningDistance = this.controls.distance;
    return new Promise<void>((res) => {
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
          .onComplete(() => {
            res();
          })
      );
    });
  }

  private rotateToRandomAngle() {
    const PI = Math.PI;
    const randomPolar = Util.randomInRange(0, PI);
    const randomA = Util.randomInRange(0, PI);
    this.controls.rotateTo(randomPolar, randomA, true);
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
    if (!this.disableAutoRotate) {
      // this.controls.azimuthAngle += 20 * deltaTime * THREE.MathUtils.DEG2RAD;
    }
    this.camera.position.applyQuaternion(targetQuaternion).add(targetPosition);
    this.camera.quaternion.premultiply(targetQuaternion);
  }
}

export default ControlsManager;
