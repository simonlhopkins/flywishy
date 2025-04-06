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

interface IdleTweenConfig {
  startAzimuth: number;
  startPolar: number;
  startDistance: number;
  duration: number;
  endAzimuth?: number;
  endPolar?: number;
  endDistance?: number;
}

enum ControlState {
  IDLE,
  CONTROLLED,
}

const PLANE_DEFAULT_POLAR_ANGLE = 0.8022233669230078;
const PLANE_DEFAULT_AZIMUTH_ANGLE = 0.7739323347923857;

class ControlsManager implements IControlsManager {
  private planet: Planet;
  private controls: CameraControls;
  private camera: THREE.PerspectiveCamera;
  private tweenManager: TweenManager;
  private lookAtPlanePercent = { value: 1 };
  private globeQuat: THREE.Quaternion = new THREE.Quaternion();
  private disableAutoRotate = false;

  private controlState: ControlState = ControlState.CONTROLLED;
  private currentIdleTween: Tween | null = null;
  private debug = false;
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
    // this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minDistance = 0.3;
    this.controls.maxDistance = 10;
    this.controls.mouseButtons.right = CameraControls.ACTION.NONE;
    this.controls.touches.two = CameraControls.ACTION.TOUCH_DOLLY;
    this.controls.touches.three = CameraControls.ACTION.NONE;
    this.controls.rotateTo(
      PLANE_DEFAULT_POLAR_ANGLE,
      PLANE_DEFAULT_AZIMUTH_ANGLE
    );
    this.initControlsEventListeners();
    this.lookAtPlane();
  }

  private createIdleTween(config: IdleTweenConfig): Promise<void> {
    const progress = { value: 0 };
    return new Promise((res, rej) => {
      this.currentIdleTween = new Tween(progress)
        .to({ value: 1 }, config.duration)
        .onUpdate(() => {
          this.controls.distance = Util.mapRange(
            progress.value,
            0,
            1,
            config.startDistance,
            config.endDistance ?? config.startDistance
          );
          this.controls.polarAngle = Util.mapRange(
            progress.value,
            0,
            1,
            config.startPolar,
            config.endPolar ?? config.startPolar
          );
          this.controls.azimuthAngle = Util.mapRange(
            progress.value,
            0,
            1,
            config.startAzimuth,
            config.endAzimuth ?? config.startAzimuth
          );
        })
        .easing(Easing.Linear.None)
        .onComplete(() => {
          this.createIdleTween(config);
          res();
        });
      this.tweenManager.add(this.currentIdleTween);
    });
  }

  private ChangeState(newState: ControlState) {
    if (this.controlState == newState) return;
    this.controlState = newState;
    switch (newState) {
      case ControlState.IDLE:
        // this.createIdleTween(config1);
        break;
      case ControlState.CONTROLLED:
        if (this.currentIdleTween) {
          this.currentIdleTween.stop();
        }
        this.currentIdleTween = null;
        break;
    }
  }

  private initControlsEventListeners() {
    let userDragging = false;
    let timeoutId: number | undefined = undefined;

    const onRest = () => {
      this.controls.removeEventListener("rest", onRest);
      userDragging = false;
      this.disableAutoRotate = false;
      console.log("rest");

      timeoutId = window.setTimeout(() => {
        this.ChangeState(ControlState.IDLE);
      }, 2000);
    };

    this.controls.addEventListener("controlstart", () => {
      this.ChangeState(ControlState.CONTROLLED);
      window.clearTimeout(timeoutId);
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

    this.initConfettiDragEvent();
    this.controls.addEventListener("transitionstart", () => {
      if (userDragging) return;
      this.disableAutoRotate = true;
      this.controls.addEventListener("rest", onRest);
    });
    onRest();
  }

  private initConfettiDragEvent() {
    let lastTime: null | number = null;
    let lastPolarAngle: null | number = null;
    let lastAzimuthAngle: null | number = null;
    //this should be different on mobile than on laptop
    const confettiThreshold = Util.isMobile() ? 15 : 50;
    this.controls.addEventListener("control", (e) => {
      const currentTime = performance.now();
      if (this.debug) {
        console.log(
          `azimuth: ${this.controls.azimuthAngle}, polar: ${this.controls.polarAngle}, distance: ${this.controls.distance}`
        );
      }
      if (
        lastPolarAngle !== null &&
        lastAzimuthAngle !== null &&
        lastTime !== null
      ) {
        // Time difference in seconds
        const deltaTime = (currentTime - lastTime) / 1000;
        if (deltaTime > 0) {
          // Calculate angular velocity
          const polarVelocity =
            Math.abs(this.controls.polarAngle - lastPolarAngle) / deltaTime;
          const azimuthVelocity =
            Math.abs(this.controls.azimuthAngle - lastAzimuthAngle) / deltaTime;
          // Check if the user flicked (fast movement)
          if (Math.max(polarVelocity, azimuthVelocity) > confettiThreshold) {
            console.log("Spawn Confetti!!!");
          }
        }
      }
      // Store values for next frame
      lastPolarAngle = this.controls.polarAngle;
      lastAzimuthAngle = this.controls.azimuthAngle;
      lastTime = currentTime;
    });
  }
  public lookAtPlane() {
    const beginningDistance = this.controls.distance;
    const targetZoom = 1;
    const beginningPolarAngle = this.controls.polarAngle;
    const beginningAzimuthAngle = this.controls.azimuthAngle;
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
            this.controls.polarAngle = Util.mapRange(
              this.lookAtPlanePercent.value,
              0,
              1,
              beginningPolarAngle,
              PLANE_DEFAULT_POLAR_ANGLE
            );
            // this.controls.azimuthAngle = Util.mapRange(
            //   this.lookAtPlanePercent.value,
            //   0,
            //   1,
            //   beginningAzimuthAngle,
            //   PLANE_DEFAULT_AZIMUTH_ANGLE
            // );
          })
          .easing(Easing.Sinusoidal.InOut)
          .onComplete(() => {
            this.controls.minDistance = 0.55;
            this.controls.maxDistance = 10;
            this.controls.maxPolarAngle = Math.PI / 2;
            res();
          })
      );
    });
  }
  public lookAtGlobe() {
    //todo, maybe save the plane pos and quat at this point, so it is more smooth
    this.globeQuat = this.planet.getPlaneQuaternion();
    const beginningDistance = this.controls.distance;
    const beginningPolarAngle = this.controls.polarAngle;
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
              Util.isMobile() ? 10 : 7
            );
            this.controls.polarAngle = Util.mapRange(
              1 - this.lookAtPlanePercent.value,
              0,
              1,
              beginningPolarAngle,
              Math.PI / 2
            );
          })
          .easing(Easing.Sinusoidal.InOut)
          .onComplete(() => {
            this.controls.minDistance = 5;
            this.controls.maxDistance = 15;
            this.controls.maxPolarAngle = Math.PI;
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
    if (this.controlState == ControlState.IDLE) {
      this.controls.azimuthAngle += deltaTime * 0.1;
    }
    if (!this.disableAutoRotate) {
      // this.controls.azimuthAngle += 20 * deltaTime * THREE.MathUtils.DEG2RAD;
    }
    this.camera.position.applyQuaternion(targetQuaternion).add(targetPosition);
    this.camera.quaternion.premultiply(targetQuaternion);
  }
}

const config1: IdleTweenConfig = {
  startAzimuth: 0,
  startPolar: 0.7574337970679396,
  startDistance: 1,
  duration: 10000,
  endAzimuth: Math.PI * 2,
};

export default ControlsManager;
