/* eslint-disable @typescript-eslint/no-magic-numbers */
const TEMPERATURES = new Map<number, {min: number; average: number; max: number}>([
  [1, {min: 96, average: 134, max: 172}],
  [2, {min: 104, average: 140, max: 176}],
  [3, {min: 112, average: 147, max: 182}],
  [4, {min: 118, average: 163, max: 208}],
  [5, {min: 133, average: 182, max: 232}],
  [6, {min: 146, average: 194, max: 242}],
  [7, {min: 152, average: 200, max: 248}],
  [8, {min: 156, average: 204, max: 262}],
  [9, {min: 150, average: 198, max: 246}],
  [10, {min: 142, average: 187, max: 232}],
  [11, {min: 136, average: 173, max: 210}],
  [12, {min: 125, average: 156, max: 186}],
  [13, {min: 114, average: 143, max: 172}],
  [14, {min: 100, average: 134, max: 168}],
  [15, {min: 90, average: 127, max: 164}],
]);
/* eslint-enable @typescript-eslint/no-magic-numbers */

export function getPlanetTemperature(position: number): number {
  const temperature = TEMPERATURES.get(position);
  if (temperature === undefined) {
    throw new Error(`Could not determine the temperature for position ${position}`);
  }
  return temperature.average;
}
