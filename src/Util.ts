export class Util {
  private static cachedIsMobile: null | boolean = null;
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

  static randomInRange(low: number, high: number) {
    return Util.mapRange(Math.random(), 0, 1, low, high);
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
  //https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
  static isMobile() {
    if (Util.cachedIsMobile) {
      return Util.cachedIsMobile;
    }
    let check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || (window as any).opera);
    Util.cachedIsMobile = check;
    return check;
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
