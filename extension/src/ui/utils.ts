import {ResourceAmount} from '@src/models/resources';

export function sum(amounts: (ResourceAmount | number)[]): ResourceAmount {
  let internalSum = 0;
  for (const amount of amounts) {
    internalSum += amount;
  }
  return internalSum as ResourceAmount;
}

export function snum(value: number): string {
  let units = value;
  let unitName = '';
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  if (units >= 1000000) {
    unitName = 'M';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    units = Math.floor(units / 1000) / 1000;
  } else if (units >= 1000) {
    unitName = 'k';
    units = Math.floor(units / 1000);
  } else {
    units = Math.floor(units);
  }
  return `${units}${unitName}`;
}
