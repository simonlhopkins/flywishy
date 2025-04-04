import * as THREE from "three";
import Planet from "./Planet";
import TweenManager from "./TweenManager";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import ControlsManager, { IControlsManager } from "./ControlsManager";
import { CityData } from "sharedTypes/CityData";
import MusicTextureManager from "./MusicTextureManager";
import Stats from "three/examples/jsm/libs/stats.module.js";
import Hls from "hls.js";
import { VisualizerOptions } from "../Store/UserStore";
interface EventListeners {
  OnCityUpdate(): void;
}
class MainScene {
  musicTextureManager: MusicTextureManager;
  controlsManager: IControlsManager | null = null;
  stats = new Stats();
  private mediaElement: HTMLMediaElement;
  private iframePlayer: YT.Player | null = null;
  private tweenManager = new TweenManager();
  private planet: Planet | null = null;
  constructor(
    mediaElement: HTMLMediaElement,
    iframeParent: HTMLDivElement,
    listeners: EventListeners,
    onReady?: () => void
  ) {
    this.musicTextureManager = new MusicTextureManager(mediaElement);
    this.mediaElement = mediaElement;
    const parentDiv = document.getElementById("flyWishy")!;
    const scene = new THREE.Scene();
    // const planeScene = new THREE.Scene();
    // const light = new THREE.AmbientLight(0xffffff); // soft white light
    // scene.add(light);
    // planeScene.add(light);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Increase intensity
    scene.add(ambientLight);
    const light = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)

    // Set light direction
    light.position.set(5, 10, 5); // X, Y, Z position

    // Optional: Enable shadows
    light.castShadow = true;

    // Add light to the scene
    scene.add(light);
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

    document.addEventListener("keydown", (event) => {
      if (event.key === "s" || event.key === "S") {
        this.toggleStats();
      }
    });
    this.toggleStats();
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
    this.initialize(scene, camera, renderer, mediaElement, iframeParent).then(
      onReady
    );
  }
  private toggleStats() {
    this.stats.dom.style.display =
      this.stats.dom.style.display == "none" ? "block" : "none";
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

    return new Promise<void>((res, rej) => {
      if (Hls.isSupported()) {
        var hls = new Hls({});
        hls.loadSource(url);
        hls.attachMedia(element);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          console.log("parsed");
          res();
        });
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log("media attatched");
        });
        hls.on(Hls.Events.BUFFER_CREATED, (event, data) => {
          console.log("BUFFER_CREATED");

          console.log(data.tracks.audio!.buffer);
          // this.musicTextureManager.onBufferCreated(data.tracks.audio!.buffer);
        });
        hls.on(Hls.Events.BUFFER_APPENDED, function (event, data) {
          if (data.type === "audio") {
            // The 'audio' type data contains the raw audio segment data
            console.log("Audio data appended:", data);
          }
        });
      } else if (element.canPlayType("application/vnd.apple.mpegurl")) {
        element.src = url;
        element.addEventListener("loadedmetadata", function () {
          res();
        });
      }
    });
  }

  private async initialize(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    mediaElement: HTMLMediaElement,
    iframeParent: HTMLDivElement
  ) {
    // await this.initializeHLSStream(video);
    const initializeCurrentTime = () => {
      const duration = mediaElement.duration; // Duration of the video
      const currentTime = Date.now() / 1000; // Current time in seconds (Unix timestamp)
      const timeToSet = currentTime % duration; // Modulo to get time within the duration

      mediaElement.currentTime = timeToSet; // Set the current time of the stream
    };
    mediaElement.addEventListener("loadedmetadata", function () {
      // element.play();
      console.log("meta");

      initializeCurrentTime();
    });
    const size = new THREE.Vector2();
    renderer.getSize(size);
    this.iframePlayer = await this.initializeIframe(iframeParent);
    const cities = await this.LoadCities();
    const planeModel = await this.LoadPlaneModel();
    const planetMaterial = await this.CreatePlanetMaterial();

    this.planet = new Planet(
      scene,
      camera,
      this.tweenManager,
      this.musicTextureManager,
      planetMaterial,
      planeModel,
      cities
    );
    const controlsManager = new ControlsManager(
      this.planet,
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
      this.planet!.update(elapsedTime, deltaTime);
      this.planet!.updateZoomScale(controlsManager.GetZoomLevel());

      this.tweenManager.update();
      //this needs to happen last!!
      controlsManager.update(elapsedTime, deltaTime);
      this.stats.update();
    };
    renderer.setAnimationLoop(animate);
  }

  public updateVisualizerOptions(visualizerOptions: VisualizerOptions) {
    if (this.planet) {
      // if (visualizerOptions.waveformEnabled) {
      //   this.controlsManager?.lookAtGlobe();
      // }
      console.log(visualizerOptions.flower);
      this.planet.updateShaderOptions(
        visualizerOptions.waveformEnabled,
        visualizerOptions.flower,
        visualizerOptions.wishyMode
      );
    }
  }

  public play() {
    this.musicTextureManager.initialize().then(() => {
      if (this.iframePlayer) {
        this.iframePlayer.playVideo();
      }
      this.tweenManager.resume();
      this.mediaElement.play();
      this.musicTextureManager.play();
    });
  }
  public pause() {
    if (this.iframePlayer) {
      this.iframePlayer.pauseVideo();
    }
    this.tweenManager.pause();
    this.mediaElement.pause();
    this.musicTextureManager.pause();
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
    const whiteSquare = new THREE.TextureLoader().load("./images/whiteSquare");
    const vertSource = await (await fetch("./shaders/planetVert.vs")).text();
    const fragSource = await (await fetch("./shaders/planetFrag.fs")).text();

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uDisplacementMap: { value: noiseTexture },
        uDotPosition: { value: new THREE.Vector3(0, 0, 0) },
        uEnergyHistory: { value: whiteSquare },
        uWaveform: { value: whiteSquare },
        uTime: { value: 0.0 },
        uOptions: { value: 0.0 },
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
        "wishy_plane.glb",
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
