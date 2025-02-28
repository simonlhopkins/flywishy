import * as THREE from "three";
import Planet from "./Planet";
import TweenManager from "./TweenManager";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import ControlsManager, { IControlsManager } from "./ControlsManager";
import { CityData } from "sharedTypes/CityData";
import MusicTextureManager from "./MusicTextureManager";

class MainScene {
  musicTextureManager: MusicTextureManager;
  controlsManager: IControlsManager | null = null;
  constructor(video: HTMLVideoElement) {
    this.musicTextureManager = new MusicTextureManager(video);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    const light = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.getElementById("flyWishy")!.appendChild(renderer.domElement);
    const texture = new THREE.TextureLoader().load(
      "./images/your_name_clouds.jpg"
    );
    scene.background = texture;

    window.addEventListener("resize", () => {
      // Update camera aspect ratio
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Update renderer size
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio); // Maintain sharpness on high-DPI screens
    });

    //async init function then we can update the scene after everything is loaded
    this.initialize(scene, camera, renderer, video);
  }

  private async initialize(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    video: HTMLVideoElement
  ) {
    const tweenManager = new TweenManager();

    const cities = await this.LoadCities();
    const planeModel = await this.LoadPlaneModel();
    const planetMaterial = await this.CreatePlanetMaterial();
    scene.background = new THREE.VideoTexture(video);

    const planet = new Planet(
      scene,
      camera,
      tweenManager,
      this.musicTextureManager,
      planetMaterial,
      planeModel,
      cities
    );
    const controlsManager = new ControlsManager(
      planet,
      camera,
      tweenManager,
      renderer.domElement
    );
    this.controlsManager = controlsManager;

    const clock = new THREE.Clock();

    clock.start();

    const animate = () => {
      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      renderer.render(scene, camera);
      controlsManager.update(elapsedTime, deltaTime);
      this.musicTextureManager.update(elapsedTime, deltaTime);
      planet.update(elapsedTime, deltaTime);
      planet.updateZoomScale(controlsManager.GetZoomLevel());

      tweenManager.update();
    };
    renderer.setAnimationLoop(animate);
  }
  lookAtPlane() {
    if (this.controlsManager) {
      this.controlsManager.lookAtPlane();
    }
  }
  lookAtGlobe() {
    if (this.controlsManager) {
      this.controlsManager.lookAtGlobe();
    }
  }
  reset() {
    this.musicTextureManager.reset();
  }

  async CreatePlanetMaterial() {
    const texture = new THREE.TextureLoader().load(
      "./images/8k_earth_daymap_small.jpg"
    );
    const noiseTexture = new THREE.TextureLoader().load(
      "./images/noiseTexture.png"
    );
    const vertSource = await (await fetch("./shaders/planetVert.vs")).text();
    const fragSource = await (await fetch("./shaders/planetFrag.fs")).text();

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uDisplacementMap: { value: noiseTexture },
        uDotPosition: { value: new THREE.Vector3(0, 0, 0) },
        uEnergyHistory: { value: texture },
        uTime: { value: 0.0 },
      },
      vertexShader: vertSource,
      fragmentShader: fragSource,
    });
    return material;
  }

  async LoadPlaneModel(): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();

      loader.setPath("./models/plane/").load(
        "airport_airplane_2.glb",
        (gltf) => {
          const plane = gltf.scene;
          const planeScale = 0.01;
          plane.scale.set(planeScale, planeScale, planeScale);
          resolve(plane);
        },
        undefined,
        function (error) {
          reject(error);
        }
      );
    });
  }
  async LoadCities(): Promise<CityData[]> {
    return new Promise((resolve, reject) => {
      fetch("./cities.json")
        .then((res) => res.json())
        .then((json) => {
          console.log(json);
          const cities = json as CityData[];
          resolve(cities);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

export default MainScene;
