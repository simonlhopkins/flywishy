import * as Tone from "tone";
import { Util } from "../Util/Util";
import * as THREE from "three";
import BinAnalyzer from "../MusicAnalyzers/BinAnalyzer";

class MusicTextureManager {
  private fft: Tone.FFT = new Tone.FFT(1024);
  private waveform: Tone.Analyser = new Tone.Analyser("waveform", 1024);
  private gainNode: Tone.Gain = new Tone.Gain();
  private audioNode: MediaElementAudioSourceNode | null = null;
  private micNode = new Tone.UserMedia();
  private bassAnalyzer: BinAnalyzer = new BinAnalyzer();
  public lowMidAnalyzer: BinAnalyzer = new BinAnalyzer();
  public midAnalyzer: BinAnalyzer = new BinAnalyzer();
  public highMidAnalyzer: BinAnalyzer = new BinAnalyzer();
  public trebleAnalyzer: BinAnalyzer = new BinAnalyzer();

  energyHistory: number[][] = [];
  private energyHistoryTexture = this.createEnergyHistoryTexture();
  private waveformTexture = this.createWaveformTexture();
  private mediaElement: HTMLMediaElement;
  private nodesInitialized = false;
  private pauseTimeout: number | null = null;
  constructor(mediaElement: HTMLMediaElement) {
    this.mediaElement = mediaElement;
    this.waveform.smoothing = 1;
    this.updateWaveformTexture();
    this.updateEnergyHistoryTexture();
  }

  public async initialize() {
    await Tone.start();
    if (!this.nodesInitialized) {
      this.audioNode = Tone.getContext().createMediaElementSource(
        this.mediaElement
      );
      const sourceNode = this.micNode;
      Tone.connect(sourceNode, this.fft);
      Tone.connect(sourceNode, this.waveform);
      // Tone.connect(sourceNode, this.gainNode);
      this.mediaElement.muted = false;

      this.gainNode.toDestination();
      this.nodesInitialized = true;
    }
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
  pause() {
    const now = Tone.now();

    // Cancel any previous automation
    this.gainNode.gain.cancelScheduledValues(now);

    // Set current value (needed if there's automation already going on)
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);

    // Fade to 0 over 1 second
    const fadeTime = 0.3;
    this.gainNode.gain.linearRampTo(0, fadeTime, now);
    this.pauseTimeout = window.setTimeout(() => {
      this.mediaElement.pause();
      if (this.audioNode) {
        this.audioNode.disconnect();
      }
    }, fadeTime * 1000);
  }
  play() {
    if (this.pauseTimeout) window.clearTimeout(this.pauseTimeout);
    if (this.audioNode) {
      Tone.connect(this.audioNode, this.gainNode);
      Tone.connect(this.audioNode, this.fft);
      Tone.connect(this.audioNode, this.waveform);
    }
    const now = Tone.now();
    this.gainNode.gain.setValueAtTime(0, now);
    console.log(now);
    this.gainNode.gain.linearRampTo(1, 0.5, now);
    this.mediaElement.play();
  }
  private getAverageEnergy(fft: Float32Array, low: number, high: number) {
    const sampleRate = Tone.getContext().sampleRate;
    return this.averageEnergyInDb(
      Util.getEnergyBins(128, fft, sampleRate, low, high)
    );
  }

  getEnergyHistoryTexture() {
    return this.energyHistoryTexture;
  }
  getWaveformTexture() {
    return this.waveformTexture;
  }
  getFFTValues() {
    return this.fft.getValue();
  }
  public getBinValues() {
    return this.getAnalyzers().map((analyzer) =>
      analyzer.getCurrentNormalizedEnergy()
    );
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

  private updateWaveformTexture() {
    const finalArr = new Uint8Array(this.waveform.size);
    finalArr.set(
      this.waveform
        .getValue()
        .map((value) => Util.mapRange(value as number, -1, 1, 0, 255)),
      0
    );
    const smoothedFinalArr = Util.smoothArray([...finalArr], 20);
    this.waveformTexture.image.data = new Uint8Array(smoothedFinalArr);
    this.waveformTexture.needsUpdate = true; // Mark texture for update
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
    this.energyHistoryTexture.image.data = finalArr; // Update the data
    this.energyHistoryTexture.needsUpdate = true; // Mark texture for update
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
    if (this.mediaElement.paused) {
      return;
    }
    this.updateBinData(elapsedTime);
    this.updateEnergyHistoryTexture();
    this.updateWaveformTexture();
  }

  private createEnergyHistoryTexture() {
    const width = 5;
    const textureHeight = 256;
    const initialData = new Uint8Array(width * textureHeight);
    initialData.fill(1);
    const energyHistoryTexture = new THREE.DataTexture(
      initialData, // Raw data array
      width, // Width of the texture
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
  private createWaveformTexture() {
    const width = this.waveform.size;
    const textureHeight = 1;
    const initialData = new Uint8Array(width * textureHeight).fill(0);
    const waveformTexture = new THREE.DataTexture(
      initialData, // Raw data array
      width, // Width of the texture
      textureHeight, // Height of the texture
      THREE.RedFormat
      // THREE.IntType
    );

    // Set texture properties
    waveformTexture.minFilter = THREE.NearestFilter;
    waveformTexture.magFilter = THREE.NearestFilter;
    waveformTexture.wrapS = THREE.ClampToEdgeWrapping;
    waveformTexture.wrapT = THREE.ClampToEdgeWrapping;
    return waveformTexture;
  }
}

export default MusicTextureManager;
