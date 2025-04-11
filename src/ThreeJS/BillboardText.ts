import * as THREE from "three";
import vertexShader from "./Shaders/labelVert.vs?raw";
import fragmentShader from "./Shaders/labelFrag.fs?raw";

class BillboardText {
  private width = 1000;
  private height = 200;
  sprite: THREE.Mesh;
  constructor(text: string, scene: THREE.Scene) {
    this.sprite = this.createBillboardText(text, new THREE.Vector3(0, 0, 0));
  }

  setVisible(isVisible: boolean) {
    this.sprite.visible = isVisible;
  }
  setPosition(pos: THREE.Vector3) {
    this.sprite.position.set(pos.x, pos.y, pos.z);
  }
  getPosition() {
    return this.sprite.position;
  }
  createTextTexture(text: string) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = this.width;
    canvas.height = this.height;

    // ctx.fillStyle = "blue";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "36px Verdana, sans-serif";
    ctx.textAlign = "left"; // Align text to the left
    ctx.textBaseline = "middle"; // Anchor text to the bottom
    ctx.fillText(text, canvas.width / 2 - 20, canvas.height / 2);

    return new THREE.CanvasTexture(canvas);
  }
  setScale(scale: number) {
    this.sprite.scale.set((this.width / this.height) * scale, scale, scale);
  }

  private createBillboardText(text: string, position: THREE.Vector3) {
    const texture = this.createTextTexture(text);
    const material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTexture: { value: texture },
        uPlaneDepthTexture: { value: texture },
      },
    });
    const sprite = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    // sprite.center.set(0, 0);
    sprite.position.set(position.x, position.y, position.z);
    sprite.scale.set(this.width / this.height, 1, 1); // Adjust size

    return sprite;
  }

  update(camera: THREE.Camera, maskTexture: THREE.Texture) {
    this.sprite.lookAt(camera.position);
    this.sprite.quaternion.copy(camera.quaternion.clone());
    (
      this.sprite.material as THREE.RawShaderMaterial
    ).uniforms.uPlaneDepthTexture.value = maskTexture;
  }
}

export default BillboardText;
