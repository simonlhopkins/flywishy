import * as THREE from "three";
import Planet from "./Planet";
import TweenManager from "./TweenManager";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import ControlsManager, { IControlsManager } from "./ControlsManager";
import { CityData } from "sharedTypes/CityData";
import MusicTextureManager from "./MusicTextureManager";
import Stats from "three/examples/jsm/libs/stats.module.js";
import Hls from "hls.js";
import useUserStore, { VisualizerOptions } from "../Store/UserStore";
import PlaneMask from "./PlaneMask";

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
  private hasBeenWarnedAboutMusic = false;
  private isDarkMode: boolean = false;
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Increase intensity
    scene.add(ambientLight);
    const lightColor = 0x0000ff;
    const light = new THREE.DirectionalLight(lightColor, 1.5); // (color, intensity)

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
    camera.layers.enable(1);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    renderer.setSize(parentDiv.clientWidth, parentDiv.clientHeight);
    parentDiv.appendChild(renderer.domElement);
    parentDiv.appendChild(this.stats.dom);

    this.toggleStats();
    toggleStatsCondtion(() => {
      this.toggleStats();
    });
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

    const onDarkModeChange = (darkMode: boolean) => {
      ambientLight.intensity = darkMode ? 0.1 : 1;
      light.color.set(darkMode ? 0x0000ff : 0xffffff);
    };
    useUserStore.subscribe((state) => {
      onDarkModeChange(state.darkMode);
    });
    onDarkModeChange(useUserStore.getInitialState().darkMode);
  }
  private toggleStats() {
    this.stats.dom.style.display =
      this.stats.dom.style.display == "none" ? "block" : "none";
  }
  public onDarkMode(darkMode: boolean) {
    this.isDarkMode = darkMode;
  }
  private initializeIframe(element: HTMLDivElement): Promise<YT.Player> {
    return new Promise<YT.Player>((res, rej) => {
      const player = new YT.Player(element, {
        videoId: "uKu6TFNjkNc",
        playerVars: {
          rel: 0,
          mute: 1,
          loop: 1,
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
      initializeCurrentTime();
    });
    const size = new THREE.Vector2();
    renderer.getSize(size);
    if (iframeParent) {
      this.iframePlayer = await this.initializeIframe(iframeParent);
    }
    const cities = await this.LoadCities();
    const planeModel = await this.LoadPlaneModel();

    this.planet = new Planet(
      scene,
      camera,
      this.tweenManager,
      this.musicTextureManager,
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

    const planeMask = new PlaneMask(size.width, size.height, camera, scene);

    const clock = new THREE.Clock();

    clock.start();

    const animate = () => {
      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // renderer.render(planeScene, camera);
      this.musicTextureManager.update(elapsedTime, deltaTime);
      this.planet!.update(elapsedTime, deltaTime, planeMask.getDepthTexture()!);
      this.planet!.updateZoomScale(controlsManager.GetDistance());
      planeMask.update(renderer, scene, camera, this.planet!.getPlanePos());

      this.tweenManager.update();
      //this needs to happen last!!
      controlsManager.update(elapsedTime, deltaTime);
      this.stats.update();
      renderer.clear();
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);
  }

  public updateVisualizerOptions(
    visualizerOptions: VisualizerOptions,
    airplaneMode: boolean
  ) {
    console.log("updating visualizer options");
    if (this.planet) {
      this.planet.updateShaderOptions(visualizerOptions, airplaneMode);
    }
  }

  public async play() {
    if (!this.hasBeenWarnedAboutMusic) {
      alert("music is about to play! Grab headphones, or don't!");
      this.hasBeenWarnedAboutMusic = true;
    }
    //for some reason you need to play before you initialize????
    this.musicTextureManager.play();
    await this.musicTextureManager.initialize();
    if (this.iframePlayer) {
      this.iframePlayer.playVideo();
    }
    this.tweenManager.resume();
  }
  public pause() {
    if (this.iframePlayer) {
      this.iframePlayer.pauseVideo();
    }
    this.tweenManager.pause();
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

  async LoadPlaneModel(): Promise<THREE.Group> {
    const modelPath = "./models/plane/";
    const fileName = "wishy_plane.glb";

    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();

      loader.setPath(modelPath).load(
        fileName,
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
          const cities = json as CityData[];
          resolve(cities);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

function toggleStatsCondtion(onSuccess: () => void) {
  let sPressCount = 0;
  let lastPressTime = 0;
  const maxDelay = 300; // max ms allowed between presses
  const targetPresses = 5;

  window.addEventListener("keydown", (e) => {
    const now = Date.now();

    if (e.key.toLowerCase() === "s") {
      if (now - lastPressTime > maxDelay) {
        // too slow, reset
        sPressCount = 0;
      }

      sPressCount++;
      lastPressTime = now;

      if (sPressCount >= targetPresses) {
        onSuccess();
        sPressCount = 0; // reset after successful trigger
      }
    } else {
      // wrong key, reset
      sPressCount = 0;
    }
  });
}

export default MainScene;
