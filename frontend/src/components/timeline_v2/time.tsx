import {Milliseconds, ZERO} from '@shared/models/time';
import {AccountTimeline} from '@shared/models/timeline';
import {Brand, substract} from '@shared/utils/type_utils';

export type PositionInTime = Brand<number, 'PositionInTime'>;

export function getTimelinePosition(
  time: Milliseconds,
  accountTimeline: AccountTimeline
): PositionInTime {
  return getPositionInTime(
    time,
    accountTimeline.start.currentTime,
    accountTimeline.currentAccount.currentTime
  );
}

// function logBase(value: number, base: number): number {
//   return Math.log(value) / Math.log(base);
// }

export function getPositionInTime(
  time: Milliseconds,
  min: Milliseconds,
  max: Milliseconds
): PositionInTime {
  const normalizedMax = substract(max, min);
  const normalizedTime = substract(time, min);
  //   return (normalizedTime / normalizedMax) as PositionInTime;

  if (normalizedTime === ZERO) {
    return 0 as PositionInTime;
  }
  return (Math.sqrt(normalizedTime) / Math.sqrt(normalizedMax)) as PositionInTime;
}

export function positionToPercent(position: PositionInTime): string {
  return `${100 * position}%`;
}
