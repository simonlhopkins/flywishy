import * as THREE from "three";
import vertexShader from "./Shaders/depthVert.vs?raw";
import fragmentShader from "./Shaders/depthFrag.fs?raw";

class PlaneMask {
  renderTarget: THREE.WebGLRenderTarget;
  maskCamera: THREE.Camera;
  constructor(
    width: number,
    height: number,
    camera: THREE.Camera,
    scene: THREE.Scene
  ) {
    this.renderTarget = new THREE.WebGLRenderTarget(width, height);
    this.renderTarget.depthTexture = new THREE.DepthTexture(width, height);
    this.renderTarget.depthTexture.type = THREE.UnsignedShortType;
    this.maskCamera = camera.clone();

    const debugMaterial = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: this.renderTarget.depthTexture },
      },
    });

    this.maskCamera.layers.enable(1);
    this.maskCamera.layers.set(1);
  }

  update(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    mainCamera: THREE.Camera,
    position: THREE.Vector3
  ) {
    this.maskCamera.position.copy(mainCamera.position.clone());
    this.maskCamera.quaternion.copy(mainCamera.quaternion.clone());

    renderer.setRenderTarget(this.renderTarget);
    renderer.clear();
    renderer.render(scene, this.maskCamera);
    renderer.setRenderTarget(null);
  }

  getDepthTexture() {
    return this.renderTarget.depthTexture;
  }
}

export default PlaneMask;
