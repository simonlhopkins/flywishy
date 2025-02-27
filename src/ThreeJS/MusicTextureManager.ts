import * as Tone from "tone";
import { Util } from "../Util";
import * as THREE from "three";
import BinAnalyzer from "../MusicAnalyzers/BinAnalyzer";

class MusicTextureManager {
  private fft: Tone.FFT = new Tone.FFT(1024);
  private audioNode: MediaElementAudioSourceNode | null = null;
  private bassAnalyzer: BinAnalyzer = new BinAnalyzer();
  public lowMidAnalyzer: BinAnalyzer = new BinAnalyzer();
  public midAnalyzer: BinAnalyzer = new BinAnalyzer();
  public highMidAnalyzer: BinAnalyzer = new BinAnalyzer();
  public trebleAnalyzer: BinAnalyzer = new BinAnalyzer();

  energyHistory: number[][] = [];
  private texture = this.createEnergyHistoryTexture();
  private videoElement: HTMLVideoElement;
  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    this.audioNode = Tone.getContext().createMediaElementSource(
      this.videoElement
    );
    Tone.connect(this.audioNode, this.fft);
    this.fft.toDestination();

    const startTone = () => {
      if (Tone.getContext().state !== "running") {
        Tone.start()
          .then(() => {
            console.log("Tone.js started!");
          })
          .catch((err) => console.error("Tone.js failed to start:", err));
      }
      // Remove the event listener after Tone.js starts
      window.removeEventListener("click", startTone);
    };

    // Add event listener
    window.addEventListener("click", startTone);
  }

  private averageEnergyInDb(dBArray: number[]) {
    // Step 1: Convert each dB value to linear scale
    const linearValues = dBArray.map((dB) => Math.pow(10, dB / 20));

    // Step 2: Calculate the average of the linear values
    const sumLinear = linearValues.reduce((sum, value) => sum + value, 0);
    const averageLinear = sumLinear / linearValues.length;

    // Step 3: Convert the average linear value back to dB
    const averageDb = 20 * Math.log10(averageLinear);

    return averageDb;
  }
  private getAverageEnergy(fft: Float32Array, low: number, high: number) {
    const sampleRate = Tone.getContext().sampleRate;
    return this.averageEnergyInDb(
      Util.getEnergyBins(128, fft, sampleRate, low, high)
    );
  }
  getTexture() {
    return this.texture;
  }
  getFFTValues() {
    return this.fft.getValue();
  }
  private getAnalyzers(): BinAnalyzer[] {
    return [
      this.bassAnalyzer,
      this.lowMidAnalyzer,
      this.midAnalyzer,
      this.highMidAnalyzer,
      this.trebleAnalyzer,
    ];
  }
  private updateEnergyHistoryTexture() {
    // if (this.initialized == false) {
    //   console.error("trying to update energy history before initialized");
    //   return;
    // }
    const numBins = 5;
    const finalArr = new Uint8Array(numBins * 256);
    const energies = this.getAnalyzers().map((analyzer) =>
      analyzer.getCurrentNormalizedEnergy()
    );
    // Update energy history
    this.energyHistory.unshift(energies.map((i) => i * 255));
    if (this.energyHistory.length > 256) {
      this.energyHistory.pop();
    }
    // Flatten history and set into final array
    const flattened = this.energyHistory.flat();
    finalArr.set(flattened, 0);

    // Update the Three.js texture
    this.texture.image.data = finalArr; // Update the data
    this.texture.needsUpdate = true; // Mark texture for update
  }

  public reset() {
    this.getAnalyzers().forEach((analyzer) => {
      analyzer.clear();
    });
  }

  private updateBinData(elapsedTime: number) {
    const addPointToBin = (binAnalyzer: BinAnalyzer, value: number) => {
      if (Number.isFinite(value)) {
        binAnalyzer.addPoint(elapsedTime, value);
      }
    };
    const fft = this.getFFTValues();
    const bass = this.getAverageEnergy(fft, 20, 140);
    const lowMid = this.getAverageEnergy(fft, 140, 400);
    const mid = this.getAverageEnergy(fft, 400, 2600);
    const highMid = this.getAverageEnergy(fft, 2600, 5200);
    const treble = this.getAverageEnergy(fft, 5200, 14000);

    addPointToBin(this.bassAnalyzer, bass);
    addPointToBin(this.lowMidAnalyzer, lowMid);
    addPointToBin(this.midAnalyzer, mid);
    addPointToBin(this.highMidAnalyzer, highMid);
    addPointToBin(this.trebleAnalyzer, treble);
  }
  update(elapsedTime: number, _deltaTime: number) {
    // if (!this.initialized) return;
    if (this.videoElement.paused) {
      return;
    }
    this.updateBinData(elapsedTime);
    this.updateEnergyHistoryTexture();
  }

  private createEnergyHistoryTexture() {
    const numBins = 5;
    const textureHeight = 256;
    const initialData = new Uint8Array(numBins * textureHeight);

    const energyHistoryTexture = new THREE.DataTexture(
      initialData, // Raw data array
      numBins, // Width of the texture
      textureHeight, // Height of the texture
      THREE.RedFormat
      // THREE.IntType
    );

    // Set texture properties
    energyHistoryTexture.minFilter = THREE.NearestFilter;
    energyHistoryTexture.magFilter = THREE.NearestFilter;
    energyHistoryTexture.wrapS = THREE.ClampToEdgeWrapping;
    energyHistoryTexture.wrapT = THREE.ClampToEdgeWrapping;
    return energyHistoryTexture;
  }
}

export default MusicTextureManager;
