export function rand(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function randomElement<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Cannot not select a random element in an empty array');
  }
  return arr[rand(0, arr.length - 1)];
}
