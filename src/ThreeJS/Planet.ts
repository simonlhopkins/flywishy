import * as THREE from "three";
import TweenManager from "./TweenManager";
import { Tween } from "@tweenjs/tween.js";
import BillboardText from "./BillboardText";
import { CityData } from "sharedTypes/CityData";
import MusicTextureManager from "./MusicTextureManager";
import { Util } from "../Util";
import ThreeJSUtils from "./ThreeJSUtils";
import Atmosphere from "./Atmosphere";
import PlaneManager from "./PlaneManager";
import MainScene from "./MainScene";
import Events from "../Events";

const UP = new THREE.Vector3(0, 1, 0);

export interface IPlanetShaderOptions {
  waveformEnabled: boolean;
  flower: boolean;
  wishyMode: boolean;
}

class PlanetShaderOptions implements IPlanetShaderOptions {
  waveformEnabled: boolean = false;
  flower: boolean = false;
  wishyMode: boolean = false;
  encode(): number {
    let packed = 0;
    const toggles = [this.waveformEnabled, this.flower, this.wishyMode];
    for (let i = 0; i < toggles.length; i++) {
      if (toggles[i]) {
        packed += Math.pow(2, i); // Instead of bitwise shift, use power of 2
      }
    }
    return packed;
  }
}

class Planet {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  planetMesh: THREE.Mesh;
  startCity: CityData;
  endCity: CityData;
  private tweenManager: TweenManager;
  cityLabels: BillboardText[] = [];
  private raycaster = new THREE.Raycaster();
  cityArr: CityData[] = [];
  private planetMaterial: THREE.ShaderMaterial;
  private musicTextureManager: MusicTextureManager;
  private atmosphere: Atmosphere;
  private radius = 4;
  private planeManager: PlaneManager;
  private shaderOptions = new PlanetShaderOptions();
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
    // this.planeMesh = planeMesh;
    this.atmosphere = new Atmosphere(this.scene, this);
    this.planeManager = new PlaneManager(this.tweenManager, planeMesh);
    this.musicTextureManager = musicTextureManager;
    const geometry = new THREE.SphereGeometry(this.radius, 32, 16);
    this.planetMaterial = planetMaterial;
    this.planetMesh = new THREE.Mesh(geometry, this.planetMaterial);
    //debug
    this.planetMesh.position.set(0, 0, 0);

    this.scene.add(this.planetMesh);

    cities.forEach((item) => {
      const label = `📍${item.city.toLocaleLowerCase()}${this.countryCodeToEmoji(
        item.iso2
      )}`;
      const newText = new BillboardText(label, scene);
      this.cityLabels.push(newText);

      const pos = Planet.latLonToUnitVector(item.lat, item.lng);
      newText.setPosition(pos.multiplyScalar(this.radius));
      (newText.sprite.material as THREE.Material).depthWrite = false;
      (newText.sprite.material as THREE.Material).depthTest = false;
      scene.add(newText.sprite);
    });

    this.startCity = cities[0];
    this.endCity = cities[0];

    scene.add(planeMesh);

    //billboard

    this.createPlaneTween(cities);
    this.tweenManager.pause();
  }
  public updateShaderOptions(options: IPlanetShaderOptions) {
    this.shaderOptions.waveformEnabled = options.waveformEnabled;
    this.shaderOptions.flower = options.flower;
    this.shaderOptions.wishyMode = options.wishyMode;
  }
  public updateZoomScale(cameraDistance: number) {
    const textScale = Util.mapRange(cameraDistance, 0, 15, 0.1, 2);
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

  private static getPosOnPlanetFromCity(city: CityData, radius: number) {
    return Planet.latLonToUnitVector(city.lat, city.lng).multiplyScalar(radius);
  }
  getPlanePos() {
    return this.planeManager.getPlanePos();
  }
  getPlaneQuaternion() {
    return this.planeManager.getPlaneQuaternion();
  }
  private chooseRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getRadius() {
    return this.radius;
  }
  createPlaneTween(cities: CityData[]) {
    const firstTime = this.startCity == this.endCity;
    this.startCity = this.endCity;

    this.endCity = this.chooseRandom(
      cities.filter((city) => city.city != this.startCity.city)
    );
    Events.Get().dispatchTypedEvent(
      "cityChanged",
      new CustomEvent("cityChanged", {
        detail: {
          fromCity: this.startCity,
          toCity: this.endCity,
        },
      })
    );
    const startPos = Planet.getPosOnPlanetFromCity(
      this.startCity,
      this.getRadius()
    );
    const endPos = Planet.getPosOnPlanetFromCity(
      this.endCity,
      this.getRadius()
    );
    this.planeManager.createPlaneTween(
      startPos,
      endPos,
      this.getRadius(),
      () => {
        this.createPlaneTween(cities);
      },
      !firstTime
    );
  }

  static GetDirectionRotationMatrixFromQuaternions(
    q1: THREE.Quaternion,
    q2: THREE.Quaternion
  ) {
    const point = UP.clone().applyQuaternion(q1);
    //forward vec is right
    const upVec = point.clone().normalize();
    const nextPoint = UP.clone()
      .applyQuaternion(q1.clone().slerp(q2, 1))
      .normalize();
    let forwardVec = point.clone().normalize().sub(nextPoint).normalize();
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

  update(
    elapsedTime: number,
    deltaTime: number,
    planeMaskTexture: THREE.Texture
  ) {
    //uniforms
    this.planetMaterial.uniforms.uTime.value = elapsedTime;
    this.planetMaterial.uniforms.uOptions.value = this.shaderOptions.encode();
    this.planetMaterial.uniforms.uDotPosition.value.copy(
      this.getPlanePos().normalize()
    );
    this.planetMaterial.uniforms.uEnergyHistory.value =
      this.musicTextureManager.getEnergyHistoryTexture();
    this.planetMaterial.uniforms.uWaveform.value =
      this.musicTextureManager.getWaveformTexture();

    this.atmosphere.update(
      elapsedTime,
      deltaTime,
      this.musicTextureManager.getBinValues()
    );
    this.planeManager.updateMaterial(
      elapsedTime,
      deltaTime,
      this.musicTextureManager.getEnergyHistoryTexture(),
      this.musicTextureManager.getWaveformTexture()
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
      billboardCity.update(this.camera, planeMaskTexture);
    });
  }
}

export default Planet;
