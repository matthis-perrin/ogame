import {Brand, multiply, substract} from '@shared/utils/type_utils';

export type Milliseconds = Brand<number, 'Milliseconds'>;

export const ZERO = 0 as Milliseconds;
export const ONE_SECOND = 1000 as Milliseconds;
export const ONE_MINUTE = (60 * ONE_SECOND) as Milliseconds;
export const ONE_HOUR = (60 * ONE_MINUTE) as Milliseconds;
export const ONE_DAY = (24 * ONE_HOUR) as Milliseconds;
export const ONE_YEAR = (365 * ONE_DAY) as Milliseconds;
export const NEVER = Infinity as Milliseconds;

export function hoursToMilliseconds(hours: number): Milliseconds {
  return multiply(ONE_HOUR, hours);
}

export function timeToString(milliseconds: Milliseconds): string {
  let remaining = milliseconds;
  const years = Math.floor(remaining / ONE_YEAR);
  remaining = substract(remaining, multiply(ONE_YEAR, years));
  const days = Math.floor(remaining / ONE_DAY);
  remaining = substract(remaining, multiply(ONE_DAY, days));
  const hours = Math.floor(remaining / ONE_HOUR);
  remaining = substract(remaining, multiply(ONE_HOUR, hours));
  const minutes = Math.floor(remaining / ONE_MINUTE);
  remaining = substract(remaining, multiply(ONE_MINUTE, minutes));
  const seconds = Math.floor(remaining / ONE_SECOND);
  remaining = substract(remaining, multiply(ONE_SECOND, seconds));

  const components = [
    {value: years, suffix: 'y'},
    {value: days, suffix: 'd'},
    {value: hours, suffix: 'h'},
    {value: minutes, suffix: 'm'},
    {value: seconds, suffix: 's'},
    // {value: remaining, suffix: 'ms'},
  ];

  while (components.length > 0 && components[0].value === 0) {
    components.shift();
  }
  while (components.length > 0 && components[components.length - 1].value === 0) {
    components.pop();
  }
  if (components.length === 0) {
    return 'start';
  }
  return components.map(({value, suffix}) => `${value}${suffix}`).join(' ');
}
