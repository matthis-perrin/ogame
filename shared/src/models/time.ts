import {Brand, multiply} from '@shared/utils/type_utils';

export type Milliseconds = Brand<number, 'Milliseconds'>;

export const ZERO = 0 as Milliseconds;
export const ONE_HOUR = (1 * 3600 * 1000) as Milliseconds;

export function hoursToMilliseconds(hours: number): Milliseconds {
  return multiply(ONE_HOUR, hours);
}
