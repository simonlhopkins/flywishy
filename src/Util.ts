export class Util {
  static mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    const inRange = inMax - inMin;
    const outRange = outMax - outMin;

    return ((value - inMin) * outRange) / inRange + outMin;
  }

  static mapRangeClamped(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ) {
    return Util.clamp(
      Util.mapRange(value, inMin, inMax, outMin, outMax),
      Math.min(outMin, outMax),
      Math.max(outMin, outMax)
    );
  }

  static getRandomElement<T>(array: T[]): T | null {
    if (array.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  static averageArray(array: Float32Array | number[]): number {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum / array.length;
  }

  static rootMeanSquared(array: Float32Array | number[]) {
    // const average = Util.averageArray(array);
    let sumSquares = 0;
    for (let i = 0; i < array.length; i++) {
      sumSquares += Math.pow(array[i], 2);
    }

    return Math.sqrt(sumSquares / array.length);
  }

  static movingAverage(data: number[], windowSize: number): number[] {
    if (windowSize <= 0) {
      throw new Error("Window size must be greater than zero");
    }

    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const average = this.averageArray(
        data.slice(Math.max(0, i - windowSize), i)
      );
      // if (i < windowSize - 1) {
      //   result.push(data[i]); // Not enough data points for a full window
      // } else {
      //   let sum = 0;
      //   for (let j = 0; j < windowSize; j++) {
      //     sum += data[i - j];
      //   }

      //   result.push(sum / windowSize);
      // }
      result.push(average);
    }
    return result;
  }

  static standardDeviation(arr: number[]) {
    const average = Util.averageArray(arr);
    return Math.sqrt(
      Util.averageArray(arr.map((i) => Math.pow(i - average, 2)))
    );
  }
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
  static isNumberInRange(number: number, range: [number, number]): boolean {
    const [lowerBound, upperBound] = range;
    return number >= lowerBound && number <= upperBound;
  }

  static findMin(array: number[]): number | undefined {
    if (array.length === 0) return undefined;
    return array.reduce(
      (min, current) => (current < min ? current : min),
      array[0]
    );
  }
  static findMax(array: number[]): number | undefined {
    if (array.length === 0) return undefined;
    return array.reduce(
      (max, current) => (current > max ? current : max),
      array[0]
    );
  }

  static findBounds(array: number[]): number[] | undefined {
    return [Util.findMin(array) || 0, Util.findMax(array) || 0];
  }
  /**
   * Linearly interpolates between two colors.
   * @param color1 The starting color in hex format (e.g., "#ff0000" for red).
   * @param color2 The ending color in hex format (e.g., "#0000ff" for blue).
   * @param t A value between 0 and 1 that indicates the interpolation factor.
   * @returns The interpolated color in hex format.
   */
  static lerpColor(color1: string, color2: string, t: number): string {
    // Ensure t is between 0 and 1
    t = Math.max(0, Math.min(1, t));

    // Parse the colors into RGB components
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    if (!c1 || !c2) {
      throw new Error("Invalid color format");
    }

    // Interpolate each component
    const r = Math.round(this.lerp(c1.r, c2.r, t));
    const g = Math.round(this.lerp(c1.g, c2.g, t));
    const b = Math.round(this.lerp(c1.b, c2.b, t));

    // Combine the components back into a hex color string
    return this.rgbToHex(r, g, b);
  }

  private static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  private static hexToRgb(
    hex: string
  ): { r: number; g: number; b: number } | null {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, "");

    let bigint;
    if (hex.length === 3) {
      bigint = parseInt(
        hex
          .split("")
          .map((hex) => hex + hex)
          .join(""),
        16
      );
    } else if (hex.length === 6) {
      bigint = parseInt(hex, 16);
    } else {
      return null;
    }

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
  }

  private static rgbToHex(r: number, g: number, b: number): string {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }

  static smoothArray(data: number[], windowSize: number): number[] {
    const smoothedData: number[] = [];

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const end = i + 1;
      const window = data.slice(start, end); // Get the values for the current window
      const average =
        window.reduce((sum, value) => sum + value, 0) / window.length;
      smoothedData.push(average);
    }

    return smoothedData;
  }

  static getEnergyBins(
    size: number,
    values: Float32Array,
    sampleRate: number,
    _minFrequency?: number,
    _maxFrequency?: number
  ) {
    let bins = [];
    const minFrequency = _minFrequency || 0;
    const maxFrequency = _maxFrequency || sampleRate / 2;
    for (let i = 0; i < size - 1; i++) {
      const f1 = Util.mapRange(i, 0, size, minFrequency, maxFrequency);
      const f2 = Util.mapRange(i + 1, 0, size, minFrequency, maxFrequency);
      const index1 = this.getIndexOfFrequency(f1, values.length, sampleRate);
      const index2 = this.getIndexOfFrequency(f2, values.length, sampleRate);

      //bug, if the index is small enough to where it just returns the index, it will return the unaltered negative value
      const energy =
        index2 - index1 > 1
          ? Util.averageArray(values.slice(index1, index2))
          : Util.averageArray([values[index1]]);

      bins.push(energy);
    }
    return bins;
  }

  static getIndexOfFrequency(hz: number, fftSize: number, sampleRate: number) {
    const nyquist = sampleRate / 2;
    const frequencyBinCount = fftSize;
    return Math.max(
      0,
      Math.min(
        frequencyBinCount - 1,
        Math.floor((hz / nyquist) * frequencyBinCount)
      )
    );
  }
}
