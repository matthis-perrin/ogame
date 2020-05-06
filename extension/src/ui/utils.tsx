import * as React from 'react';

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

export function padTime(value: number, length = 2): string {
  let res = value.toString();
  while (res.length < length) {
    res = `0${res}`;
  }
  return res;
}

function time(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  const seconds = totalSeconds - hours * 3600 - minutes * 60;
  return `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`;
}

export function timeEl(totalSeconds: number): JSX.Element {
  const titleDate = new Date(new Date().getTime() + totalSeconds * 1000);
  return <span title={titleDate.toLocaleString()}>{time(totalSeconds)}</span>;
}

export function thousands(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
