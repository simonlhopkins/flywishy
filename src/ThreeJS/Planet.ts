import * as THREE from "three";
import TweenManager from "./TweenManager";
import { Tween } from "@tweenjs/tween.js";
import BillboardText from "./BillboardText";
import { CityData } from "sharedTypes/CityData";
import MusicTextureManager from "./MusicTextureManager";
import { Util } from "../Util";
import ThreeJSUtils from "./ThreeJSUtils";
import Atmosphere from "./Atmosphere";

const UP = new THREE.Vector3(0, 1, 0);

class Planet {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  planetMesh: THREE.Mesh;
  startCity: CityData;
  endCity: CityData;
  planeMesh: THREE.Group;
  debugPoint: THREE.Mesh;
  private tweenManager: TweenManager;
  cityLabels: BillboardText[] = [];
  private raycaster = new THREE.Raycaster();
  cityArr: CityData[] = [];
  private planetMaterial: THREE.ShaderMaterial;
  private musicTextureManager: MusicTextureManager;
  private atmosphere: Atmosphere;
  private radius = 4;
  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    tweenManager: TweenManager,
    musicTextureManager: MusicTextureManager,
    planetMaterial: THREE.ShaderMaterial,
    planeMesh: THREE.Group,
    cities: CityData[]
  ) {
    this.scene = scene;
    this.camera = camera;
    this.tweenManager = tweenManager;
    this.planeMesh = planeMesh;
    this.atmosphere = new Atmosphere(this.scene, this);
    this.musicTextureManager = musicTextureManager;
    const geometry = new THREE.SphereGeometry(this.radius, 32 * 2, 16 * 2);
    this.planetMaterial = planetMaterial;
    this.planetMesh = new THREE.Mesh(geometry, this.planetMaterial);
    //debug
    this.planetMesh.position.set(0, 0, 0);
    this.scene.add(planeMesh);
    this.scene.add(this.planetMesh);

    //testing out slerp
    this.debugPoint = ThreeJSUtils.CreateSphere();
    this.scene.add(this.debugPoint);

    cities.forEach((item) => {
      const label = `📍${item.city.toLocaleLowerCase()}${this.countryCodeToEmoji(
        item.iso2
      )}`;
      const newText = new BillboardText(label, scene);
      this.cityLabels.push(newText);
      const pos = Planet.latLonToUnitVector(item.lat, item.lng);
      newText.setPosition(pos.multiplyScalar(this.radius));
    });

    this.startCity = cities[0];
    this.endCity = cities[0];

    //depth order

    this.cityLabels.forEach((label) => {
      label.sprite.renderOrder = 1;
      label.sprite.material.depthWrite = false;
      label.sprite.material.depthTest = false;
    });

    //billboard

    this.createPlaneTween(cities);
  }
  public updateZoomScale(zoom: number) {
    const textScale = Util.mapRange(
      THREE.MathUtils.smoothstep(zoom, 0, 0.5),
      0,
      1,
      0.2,
      1
    );
    this.cityLabels.forEach((item) => {
      item.setScale(textScale);
    });
  }

  private countryCodeToEmoji(code: string): string {
    return code
      .toUpperCase()
      .split("")
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join("");
  }

  private getPosOnPlanetFromCity(city: CityData) {
    return Planet.latLonToUnitVector(city.lat, city.lng).multiplyScalar(
      this.radius
    );
  }
  getPlanePos() {
    return this.planeMesh.position.clone();
  }
  getPlaneQuaternion() {
    return this.planeMesh.quaternion.clone();
  }
  private chooseRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getRadius() {
    return this.radius;
  }
  createPlaneTween(cities: CityData[]) {
    this.startCity = this.endCity;
    this.endCity = this.chooseRandom(
      cities.filter((city) => city.city != this.startCity.city)
    );
    console.log(this.startCity.city + "=>" + this.endCity.city);
    const startPos = this.getPosOnPlanetFromCity(this.startCity);
    const endPos = this.getPosOnPlanetFromCity(this.endCity);
    this.planeMesh.position.copy(startPos);
    const q1 = new THREE.Quaternion().setFromUnitVectors(
      UP,
      startPos.clone().normalize()
    );
    const q2 = new THREE.Quaternion().setFromUnitVectors(
      UP,
      endPos.clone().normalize()
    );
    // const dot = q1.clone().dot(q2);

    // Clamp the dot product to avoid NaN due to precision issues
    // const clampedDot = Math.max(-1, Math.min(1, dot));

    // Calculate the angle using arccos
    // const angle = Math.acos(clampedDot);
    // const velocityScale = 10000;
    // const constTime = angle * velocityScale;
    const progress = { value: 0 };

    this.tweenManager.add(
      new Tween(progress)
        .to({ value: 1 }, 5000)
        .onUpdate(() => {
          this.updatePlanePos(q1, q2, progress.value);
        })
        .onComplete(() => {
          this.createPlaneTween(cities);
        })
        .delay(1000)
    );
  }
  static latLonToUnitVector(lat: number, lng: number): THREE.Vector3 {
    // Convert latitude and longitude from degrees to radians
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    // Calculate the Cartesian coordinates for a unit sphere
    const x = Math.cos(latRad) * Math.cos(lngRad); // Right (East-West)
    const z = -Math.cos(latRad) * Math.sin(lngRad); // Forward (North-South)
    const y = Math.sin(latRad); // Up (Vertical)

    return new THREE.Vector3(x, y, z); // Return as a Three.js Vector3
  }
  updatePlanePos(q1: THREE.Quaternion, q2: THREE.Quaternion, progress: number) {
    if (this.planeMesh) {
      //this represents the percent from start to finish you are.
      const smoothstepProgress = THREE.MathUtils.smootherstep(
        progress,
        0.1,
        0.9
      );
      let r =
        smoothstepProgress < 0.5
          ? THREE.MathUtils.smootherstep(smoothstepProgress, 0, 0.2)
          : 1 - THREE.MathUtils.smootherstep(smoothstepProgress, 0.7, 1);
      r = Util.mapRange(r, 0, 1, this.radius, this.radius + 0.5);

      const slerpedQ = q1.clone().slerp(q2, smoothstepProgress);
      const point = UP.clone().applyQuaternion(slerpedQ).multiplyScalar(r);
      //forward vec is right
      const upVec = point.clone().normalize();
      const nextPoint = UP.clone()
        .applyQuaternion(q1.clone().slerp(q2, smoothstepProgress + 0.01))
        .normalize();
      let forwardVec = point.clone().normalize().sub(nextPoint).normalize();
      const rightVec = new THREE.Vector3()
        .crossVectors(forwardVec, upVec)
        .normalize();
      //lol the actual forward vec I guess may not be entirely perpendicular to the upvector so this just makes sure that it will be!
      forwardVec = new THREE.Vector3().crossVectors(upVec, rightVec);

      let yRotAmount = 1;

      const y180 = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), // Local Y-axis
        Util.mapRange(yRotAmount, 0, 1, 0, Math.PI) // 180 degrees in radians
      );

      const rotationMatrix = new THREE.Matrix4().makeBasis(
        forwardVec,
        upVec,
        rightVec
      );
      this.planeMesh.position.lerp(point, 0.3);
      // this.plane.position.set(point.x, point.y, point.z);

      const targetQuaternion = new THREE.Quaternion()
        .setFromRotationMatrix(rotationMatrix)
        .multiply(y180);
      this.planeMesh.quaternion.slerp(targetQuaternion, 0.1);
    }
  }
  update(elapsedTime: number, deltaTime: number) {
    //uniforms
    this.planetMaterial.uniforms.uTime.value = elapsedTime;
    this.planetMaterial.uniforms.uDotPosition.value.copy(
      this.getPlanePos().normalize()
    );
    this.planetMaterial.uniforms.uEnergyHistory.value =
      this.musicTextureManager.getTexture();

    this.atmosphere.update(
      elapsedTime,
      deltaTime,
      this.musicTextureManager.getBinValues()
    );
    //cities
    this.cityLabels.forEach((billboardCity) => {
      const direction = new THREE.Vector3();
      direction
        .subVectors(this.camera.position, billboardCity.getPosition())
        .normalize();
      this.raycaster.set(billboardCity.getPosition(), direction);
      const intersects = this.raycaster.intersectObject(this.planetMesh);
      if (intersects.length > 0) {
        billboardCity.setVisible(false);
      } else {
        billboardCity.setVisible(true);
      }
    });
  }
}

export default Planet;
