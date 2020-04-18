export function arrayJoin<T>(arr: T[], joiner: (index: number) => T): T[] {
  if (arr.length < 2) {
    return arr;
  }
  const joined: T[] = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    joined.push(joiner(i - 1));
    joined.push(arr[i]);
  }
  return joined;
}

export function splitOnce(value: string, splitter: string): [string] | [string, string] {
  const splitterIndex = value.indexOf(splitter);
  if (splitterIndex === -1) {
    return [value];
  }
  return [value.slice(0, splitterIndex), value.slice(splitterIndex + 1)];
}
