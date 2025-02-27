import { Util } from "../Util";

interface DataPoint {
  time: number;
  energy: number;
  movingAverage: number;
  isPeak: boolean;
  zScore: number;
}

interface PeakEntry {
  time: number;
  zScore: number;
}

class EnergyAnalyzer {
  data: DataPoint[] = [];
  average: number = 0;
  stdDev: number = 0;
  private movingAverageWindowSize = 8;
  private analysisTime = 5;
  peaks: PeakEntry[] = [];
  min: number = Infinity;
  max: number = -Infinity;

  constructor(analysisTime?: number) {
    if (analysisTime != undefined) {
      this.analysisTime = analysisTime;
    }
  }

  getAnalysisTime() {
    return this.analysisTime;
  }
  addPoint(time: number, energy: number) {
    if (this.data.length > 0 && time - this.data[0].time > this.analysisTime) {
      this.data.shift();
    }
    if (Number.isFinite(energy)) {
      this.max = Math.max(this.max, energy);
      this.min = Math.min(this.min, energy);
    }

    this.data.push({
      time,
      energy,
      average: 0,
      movingAverage: 0,
      isPeak: false,
      zScore: 0,
    } as DataPoint);

    const energies = this.data.map((i) => i.energy);
    this.average = Util.averageArray(energies);
    this.stdDev = Util.standardDeviation(energies);

    const zScore = EnergyAnalyzer.calcZScore(energy, this.average, this.stdDev);
    const isPeak = zScore > 0.5;
    this.data[this.data.length - 1].zScore = zScore;
    if (
      isPeak &&
      this.data.length > 0 &&
      !this.data[this.data.length - 2].isPeak
    ) {
      this.peaks.push({
        time,
        zScore,
      });
    }
    this.data[this.data.length - 1].isPeak = isPeak;
    const windowSize = Math.min(this.movingAverageWindowSize, this.data.length);
    const windowData = this.data.slice(-windowSize).map((i) => i.energy);
    this.data[this.data.length - 1].movingAverage =
      Util.averageArray(windowData);
  }
  getLatestPeak() {
    if (this.peaks.length > 0) {
      return this.peaks[this.peaks.length - 1];
    }
    return null;
  }
  getLatestEnergy() {
    if (this.data.length > 0) {
      return this.data[this.data.length - 1];
    }
    return null;
  }
  getAnalyzerPecent(min: number, max: number) {
    const latestEnergy = this.getLatestEnergy();
    if (latestEnergy == null) {
      return 0;
    }

    return Util.mapRangeClamped(latestEnergy.energy, min, max, 0, 1);
  }
  clear() {
    this.data = [];
    this.average = 0;
    this.stdDev = 0;
    this.peaks = [];
    this.min = Infinity;
    this.max = -Infinity;
  }

  getDebugText() {
    return `min: ${this.min}, max: ${this.max},  latest: ${
      this.getLatestEnergy()?.energy
    }, average: ${this.average}, std: ${this.stdDev}`;
  }

  static calcZScore(value: number, average: number, stdDev: number) {
    return (value - average) / stdDev;
  }
}

export default EnergyAnalyzer;
