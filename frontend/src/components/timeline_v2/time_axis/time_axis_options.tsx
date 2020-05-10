import {DeepPartial} from '@shared/utils/type_utils';

export interface TextOptions {
  padding: number;
  font: string;
  fillStyle: string;
}

export interface LineOptions {
  strokeStyle: string;

  lineCap: CanvasLineCap;
  lineDashOffset: number;
  lineJoin: CanvasLineJoin;
  lineWidth: number;
  miterLimit: number;

  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface TimePeriodOptions {
  text: TextOptions;
  line: LineOptions;
  height: number;
}

export interface TimeAxisOptions {
  ticks: TimePeriodOptions;
  group: TimePeriodOptions;
  ticksHeight: number;
  subticksHeight: number;
}

const defaultLineOptions: LineOptions = {
  strokeStyle: '#000000',
  lineCap: 'butt', // 'square' might be better
  lineDashOffset: 0,
  lineJoin: 'miter',
  lineWidth: 1,
  miterLimit: 10,

  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
};

export const defaultOptions: TimeAxisOptions = {
  ticks: {
    line: defaultLineOptions,
    text: {font: '11px Verdana', padding: 3, fillStyle: '#000000'},
    height: 18,
  },
  group: {
    line: defaultLineOptions,
    text: {font: '13px Verdana', padding: 16, fillStyle: '#000000'},
    height: 28,
  },
  ticksHeight: 6,
  subticksHeight: 2,
};

function mergeTimePeriodOptions(
  options: TimePeriodOptions,
  overrides: DeepPartial<TimePeriodOptions>
): TimePeriodOptions {
  return {
    height: overrides.height !== undefined ? overrides.height : options.height,
    line: overrides.line ? {...options.line, ...overrides.line} : options.line,
    text: overrides.text ? {...options.text, ...overrides.text} : options.text,
  };
}

export function mergeOptions(
  options: TimeAxisOptions,
  overrides: DeepPartial<TimeAxisOptions>
): TimeAxisOptions {
  return {
    ticks: mergeTimePeriodOptions(options.ticks, overrides.ticks ?? {}),
    group: mergeTimePeriodOptions(options.group, overrides.group ?? {}),
    ticksHeight: overrides.ticksHeight !== undefined ? overrides.ticksHeight : options.ticksHeight,
    subticksHeight:
      overrides.subticksHeight !== undefined ? overrides.subticksHeight : options.subticksHeight,
  };
}
