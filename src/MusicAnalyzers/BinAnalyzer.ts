import { Util } from "../Util";
import EnergyAnalyzer from "./EnergyAnalyzer";
const analysisTime = 3;
class BinAnalyzer {
  private energyAnalyzer: EnergyAnalyzer = new EnergyAnalyzer(analysisTime);
  private minAnalyzer: EnergyAnalyzer = new EnergyAnalyzer(analysisTime);
  private maxAnalyzer: EnergyAnalyzer = new EnergyAnalyzer(analysisTime);
  private min: number = Infinity;
  private max: number = -Infinity;
  private current: number = 0;

  constructor() {}

  public addPoint(time: number, energy: number) {
    this.current = energy;
    this.energyAnalyzer.addPoint(time, energy);
    //calculate the min of the current bin by getting the average += a standard deviation
    const newMin = this.energyAnalyzer.average - this.energyAnalyzer.stdDev;
    const newMax = this.energyAnalyzer.average + this.energyAnalyzer.stdDev;
    //add the point to an analyzer that is looking at the min and max over time
    this.minAnalyzer.addPoint(time, newMin);
    this.maxAnalyzer.addPoint(time, newMax);
    //TODO: big changes in the min and max/ big changes in the average should adjust more dynamically
    //TODO: try with a rolling average and a rolling standard deviation that incorperates ALL values

    this.min = this.minAnalyzer.average - this.minAnalyzer.stdDev;
    this.max = this.maxAnalyzer.average + this.minAnalyzer.stdDev;
  }

  public clear() {
    this.energyAnalyzer.clear();
    this.minAnalyzer.clear();
    this.maxAnalyzer.clear();
  }
  public setMinMax(min: number, max: number) {
    this.min = min;
    this.max = max;
  }
  public getMinMax() {
    return {
      min: this.min,
      max: this.max,
    };
  }
  public getCurrentNormalizedEnergy() {
    if (Number.isFinite(this.min) && Number.isFinite(this.max)) {
      return Util.mapRangeClamped(this.current, this.min, this.max, 0, 1);
    }
    return 0;
  }
  public resetMinMax() {
    this.min = Infinity;
    this.max = -Infinity;
  }
}

export default BinAnalyzer;
