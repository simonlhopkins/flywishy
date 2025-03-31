import * as THREE from "three";
import TweenManager from "./TweenManager";
import Planet from "./Planet";
import { Tween } from "@tweenjs/tween.js";
import { Util } from "../Util";
import MusicTextureManager from "./MusicTextureManager";

const UP = new THREE.Vector3(0, 1, 0);

class PlaneManager {
  private planeMesh: THREE.Group;
  private tweenManager: TweenManager;
  private planeMaterial: THREE.RawShaderMaterial | null = null;
  //hell yea bro we can make a state machine now...

  constructor(tweenManager: TweenManager, planeMesh: THREE.Group) {
    this.planeMesh = planeMesh;
    this.tweenManager = tweenManager;

    this.CreatePlaneMaterial().then((mat) => {
      this.planeMaterial = mat;

      this.planeMesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = this.planeMaterial!;
        }
      });
    });
  }
  async CreatePlaneMaterial() {
    const texture = new THREE.TextureLoader().load(
      "./images/wishyPlaneTexture.png"
    );
    const vertSource = await (await fetch("./shaders/planeVert.vs")).text();
    const fragSource = await (await fetch("./shaders/planeFrag.fs")).text();

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uEnergyHistory: { value: texture },
        uWaveform: { value: texture },
        uTime: { value: 0.0 },
      },
      vertexShader: vertSource,
      fragmentShader: fragSource,
    });
    return material;
  }
  getPlanePos() {
    return this.planeMesh.position.clone();
  }
  getPlaneQuaternion() {
    return this.planeMesh.quaternion.clone();
  }
  static GetDirectionRotationMatrixFromQuaternions(
    q1: THREE.Quaternion,
    q2: THREE.Quaternion
  ) {
    const p1 = UP.clone().applyQuaternion(q1);
    //forward vec is right
    const upVec = p1.clone().normalize();
    const p2 = UP.clone().applyQuaternion(q2).normalize();
    let forwardVec = p1.clone().normalize().sub(p2).normalize();
    const rightVec = new THREE.Vector3()
      .crossVectors(forwardVec, upVec)
      .normalize();
    //lol the actual forward vec I guess may not be entirely perpendicular to the upvector so this just makes sure that it will be!
    forwardVec = new THREE.Vector3().crossVectors(upVec, rightVec);

    const rotationMatrix = new THREE.Matrix4().makeBasis(
      forwardVec,
      upVec,
      rightVec
    );
    return rotationMatrix;
  }

  createPlaneTween(
    startPos: THREE.Vector3,
    endPos: THREE.Vector3,
    planetRadius: number,
    onComplete: () => void,
    turnToFaceNewDirection?: boolean
  ) {
    turnToFaceNewDirection = turnToFaceNewDirection ?? true;
    this.planeMesh.position.copy(startPos);
    const q1 = new THREE.Quaternion().setFromUnitVectors(
      UP,
      startPos.clone().normalize()
    );
    const q2 = new THREE.Quaternion().setFromUnitVectors(
      UP,
      endPos.clone().normalize()
    );
    const dot = Math.max(
      -1,
      Math.min(1, startPos.normalize().dot(endPos.normalize()))
    );
    let angle = Math.acos(dot);

    const normalizedArcLength = Util.mapRange(angle, 0, Math.PI, 0, 1);
    const time = Util.mapRange(normalizedArcLength, 0, 1, 2000, 5000);

    const progress = { value: 0 };

    //create a start direction from
    const startRotMatrix = Planet.GetDirectionRotationMatrixFromQuaternions(
      q1,
      q1.clone().slerp(q2, 0.001)
    );
    const endRotMatrix = Planet.GetDirectionRotationMatrixFromQuaternions(
      q1.clone().slerp(q2, 0.999),
      q2
    );

    const y180 = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0), // Local Y-axis
      Math.PI
    );
    const startDirQuat = new THREE.Quaternion()
      .setFromRotationMatrix(startRotMatrix)
      .multiply(y180);
    const endDirQuat = new THREE.Quaternion()
      .setFromRotationMatrix(endRotMatrix)
      .multiply(y180);

    const flyPlane = () => {
      this.tweenManager.add(
        new Tween(progress)
          .to({ value: 1 }, time)
          .onUpdate(() => {
            this.updatePlanePos(
              q1,
              q2,
              startDirQuat,
              endDirQuat,
              planetRadius,
              progress.value
            );
          })
          .onComplete(onComplete)
          .delay(1000)
      );
    };
    if (turnToFaceNewDirection) {
      this.turnPlane(this.planeMesh.quaternion.clone(), startDirQuat).then(
        flyPlane
      );
    } else {
      this.planeMesh.quaternion.copy(startDirQuat);
      flyPlane();
    }

    //calculate the start and end direction
  }

  private async turnPlane(from: THREE.Quaternion, to: THREE.Quaternion) {
    const progress = { value: 0 };
    const onUpdate = () => {
      this.planeMesh.quaternion.copy(from.slerp(to, progress.value));
    };
    return new Promise((res, rej) => {
      this.tweenManager.add(
        new Tween(progress)
          .to({ value: 1 }, 1000)
          .onUpdate(onUpdate)
          .onComplete(res)
          .delay(1000)
      );
    });
  }

  private updatePlanePos(
    q1: THREE.Quaternion,
    q2: THREE.Quaternion,
    startDirectionQuat: THREE.Quaternion,
    endDirectionQuat: THREE.Quaternion,
    planetRadius: number,
    progress: number
  ) {
    if (this.planeMesh) {
      //this represents the percent from start to finish you are.
      const smoothstepProgress = THREE.MathUtils.smootherstep(progress, 0, 1);
      let r =
        smoothstepProgress < 0.5
          ? THREE.MathUtils.smootherstep(smoothstepProgress, 0, 0.2)
          : 1 - THREE.MathUtils.smootherstep(smoothstepProgress, 0.7, 1);
      r = Util.mapRange(r, 0, 1, planetRadius, planetRadius + 0.5);

      const positionQuaternion = q1.clone().slerp(q2, smoothstepProgress);
      const point = UP.clone()
        .applyQuaternion(positionQuaternion)
        .multiplyScalar(r);
      this.planeMesh.position.copy(point);
      const directionQuaternion = startDirectionQuat
        .clone()
        .slerp(endDirectionQuat, smoothstepProgress);
      this.planeMesh.quaternion.copy(directionQuaternion);
    }
  }

  public updateMaterial(
    elapsedTime: number,
    deltaTime: number,
    musicTexture: THREE.DataTexture,
    waveformTexture: THREE.DataTexture
  ) {
    if (this.planeMaterial) {
      this.planeMaterial.uniforms.uTime.value = elapsedTime;
      this.planeMaterial.uniforms.uEnergyHistory.value = musicTexture;
      this.planeMaterial.uniforms.uWaveform.value = waveformTexture;
    }
  }
}

export default PlaneManager;
