import {daysInWeek} from '@src/components/timeline_v2/time_axis/time_constants';

export type PeriodFormatter = (date: Date) => string;

function dateTimeFormatter(options: Intl.DateTimeFormatOptions): PeriodFormatter {
  return new Intl.DateTimeFormat('default', options).format;
}

function paddedNumber(value: number): string {
  return value >= 10 ? `${value}` : `0${value}`;
}

export const shortYearDateTimeFormatter: PeriodFormatter = dateTimeFormatter({year: '2-digit'});
export const yearDateTimeFormatter: PeriodFormatter = dateTimeFormatter({year: 'numeric'});
export const shortMonthDateTimeFormatter: PeriodFormatter = dateTimeFormatter({month: 'short'});
export const longMonthDateTimeFormatter: PeriodFormatter = dateTimeFormatter({month: 'long'});
export const dayDateTimeFormatter: PeriodFormatter = dateTimeFormatter({day: '2-digit'});
export const hourDateTimeFormatter: PeriodFormatter = date => paddedNumber(date.getHours());
export const minuteDateTimeFormatter: PeriodFormatter = date => paddedNumber(date.getMinutes());
export const secondDateTimeFormatter: PeriodFormatter = date => paddedNumber(date.getSeconds());

export const shortMonthAndYearFormatter: PeriodFormatter = date =>
  `${shortMonthDateTimeFormatter(date)} ${yearDateTimeFormatter(date)}`;
export const longMonthAndYearFormatter: PeriodFormatter = date =>
  `${longMonthDateTimeFormatter(date)} ${yearDateTimeFormatter(date)}`;

export const weekFormatter: PeriodFormatter = date => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  d.setUTCDate(d.getUTCDate() + 4 - ((d.getUTCDay() + daysInWeek) % daysInWeek));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNumber = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / (24 * 3600 * 1000) + 1) / daysInWeek
  );
  return weekNumber >= 10 ? `W-${weekNumber}` : `W-${weekNumber}`;
};

export const hourWithSuffixTimeFormatter: PeriodFormatter = date => `${date.getHours()}h`;
export const noZeroHourTimeFormatter: PeriodFormatter = date =>
  date.getHours() === 0 ? '' : hourWithSuffixTimeFormatter(date);
export const noZeroMinuteTimeFormatter: PeriodFormatter = date =>
  date.getMinutes() === 0 ? '' : minuteDateTimeFormatter(date);
export const noZeroSecondTimeFormatter: PeriodFormatter = date =>
  date.getSeconds() === 0 ? '' : secondDateTimeFormatter(date);

export const hourWithSuffixAndDayAndMonthTimeFormatter: PeriodFormatter = date =>
  `${dayDateTimeFormatter(date)} ${shortMonthDateTimeFormatter(
    date
  )}, ${hourWithSuffixTimeFormatter(date)}`;

export const dayAndShortMonthFormatter: PeriodFormatter = date =>
  `${dayDateTimeFormatter(date)} ${shortMonthDateTimeFormatter(date)}`;
export const dayAndShortMonthAndYearFormatter: PeriodFormatter = date =>
  `${dayDateTimeFormatter(date)} ${shortMonthDateTimeFormatter(date)}, ${yearDateTimeFormatter(
    date
  )}`;
export const dayAndLongMonthFormatter: PeriodFormatter = date =>
  `${dayDateTimeFormatter(date)} ${longMonthDateTimeFormatter(date)}`;
export const dayAndLongMonthAndYearFormatter: PeriodFormatter = date =>
  `${dayDateTimeFormatter(date)} ${longMonthDateTimeFormatter(date)}, ${yearDateTimeFormatter(
    date
  )}`;

export const hourAndMinuteFormatter: PeriodFormatter = date =>
  `${date.getHours()}h${minuteDateTimeFormatter(date)}`;

export const hourAndMinuteAndSecondFormatter: PeriodFormatter = date =>
  `${date.getHours()}:${minuteDateTimeFormatter(date)}:${secondDateTimeFormatter(date)}`;

export const millisecondFormatter: PeriodFormatter = date => `${date.getMilliseconds()}ms`;
