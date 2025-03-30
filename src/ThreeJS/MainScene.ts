import * as THREE from "three";
import Planet from "./Planet";
import TweenManager from "./TweenManager";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import ControlsManager, { IControlsManager } from "./ControlsManager";
import { CityData } from "sharedTypes/CityData";
import MusicTextureManager from "./MusicTextureManager";
import Stats from "three/examples/jsm/libs/stats.module.js";
import Hls from "hls.js";

class MainScene {
  musicTextureManager: MusicTextureManager;
  controlsManager: IControlsManager | null = null;
  stats = new Stats();
  private video: HTMLVideoElement;
  private iframePlayer: YT.Player | null = null;
  private tweenManager = new TweenManager();
  constructor(
    video: HTMLVideoElement,
    iframeParent: HTMLDivElement,
    onReady?: () => void
  ) {
    this.musicTextureManager = new MusicTextureManager(video);
    this.video = video;
    const parentDiv = document.getElementById("flyWishy")!;
    const scene = new THREE.Scene();
    // const planeScene = new THREE.Scene();
    const light = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light);
    // planeScene.add(light);
    const camera = new THREE.PerspectiveCamera(
      75,
      parentDiv.clientWidth / parentDiv.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    renderer.setSize(parentDiv.clientWidth, parentDiv.clientHeight);
    parentDiv.appendChild(renderer.domElement);
    parentDiv.appendChild(this.stats.dom);

    window.addEventListener("resize", () => {
      const parentDiv = document.getElementById("flyWishy")!;
      // Update camera aspect ratio
      camera.aspect = parentDiv.clientWidth / parentDiv.clientHeight;
      camera.updateProjectionMatrix();

      // Update renderer size
      renderer.setSize(parentDiv.clientWidth, parentDiv.clientHeight);

      renderer.setPixelRatio(window.devicePixelRatio); // Maintain sharpness on high-DPI screens
    });
    //async init function then we can update the scene after everything is loaded
    this.initialize(scene, camera, renderer, video, iframeParent).then(onReady);
  }

  private initializeIframe(element: HTMLDivElement): Promise<YT.Player> {
    return new Promise<YT.Player>((res, rej) => {
      const player = new YT.Player(element, {
        videoId: "uKu6TFNjkNc",
        playerVars: {
          rel: 0,
          mute: 1,
        },
        events: {
          onReady: () => {
            res(player);
          },
          onError: () => {
            rej("error loading iFrame");
          },
          onStateChange: () => {},
        },
      });
    });
  }

  private async initializeHLSStream(element: HTMLMediaElement) {
    const url = "https://d1d621jepmseha.cloudfront.net/wishyStream/video.m3u8";
    console.log("initialize stream");
    const initializeCurrentTime = () => {
      const duration = element.duration; // Duration of the video
      const currentTime = Date.now() / 1000; // Current time in seconds (Unix timestamp)
      const timeToSet = currentTime % duration; // Modulo to get time within the duration

      element.currentTime = timeToSet; // Set the current time of the stream
    };
    element.addEventListener("loadedmetadata", function () {
      // element.play();
      initializeCurrentTime();
    });
    return new Promise<void>((res, rej) => {
      if (Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(element);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          // element.play();
          console.log("parsed");
          res();
        });
      } else if (element.canPlayType("application/vnd.apple.mpegurl")) {
        element.src = url;
        element.addEventListener("loadedmetadata", function () {
          // element.play();
          res();
        });
      }
    });
  }

  private async initialize(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    video: HTMLVideoElement,
    iframeParent: HTMLDivElement
  ) {
    // await this.initializeHLSStream(video);

    const size = new THREE.Vector2();
    renderer.getSize(size);
    this.iframePlayer = await this.initializeIframe(iframeParent);
    const cities = await this.LoadCities();
    const planeModel = await this.LoadPlaneModel();
    const planetMaterial = await this.CreatePlanetMaterial();

    const planet = new Planet(
      scene,
      camera,
      this.tweenManager,
      this.musicTextureManager,
      planetMaterial,
      planeModel,
      cities
    );
    const controlsManager = new ControlsManager(
      planet,
      camera,
      this.tweenManager,
      renderer.domElement
    );
    this.controlsManager = controlsManager;

    const clock = new THREE.Clock();

    clock.start();

    const animate = () => {
      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      renderer.autoClear = false;
      renderer.clear();

      renderer.render(scene, camera);
      renderer.clearDepth();
      // renderer.render(planeScene, camera);
      this.musicTextureManager.update(elapsedTime, deltaTime);
      planet.update(elapsedTime, deltaTime);
      planet.updateZoomScale(controlsManager.GetZoomLevel());

      this.tweenManager.update();
      //this needs to happen last!!
      controlsManager.update(elapsedTime, deltaTime);
      this.stats.update();
    };
    renderer.setAnimationLoop(animate);
  }
  public play() {
    if (this.iframePlayer) {
      this.iframePlayer.playVideo();
    }
    this.tweenManager.resume();
    this.video.play();
  }
  public pause() {
    if (this.iframePlayer) {
      this.iframePlayer.pauseVideo();
    }
    this.tweenManager.pause();
    this.video.pause();
  }
  async lookAtPlane() {
    if (this.controlsManager) {
      await this.controlsManager.lookAtPlane();
    }
  }
  async lookAtGlobe() {
    if (this.controlsManager) {
      await this.controlsManager.lookAtGlobe();
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
