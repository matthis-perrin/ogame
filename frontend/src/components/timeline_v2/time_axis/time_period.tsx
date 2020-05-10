import {
  CenturyPeriodAligner,
  DayPeriodAligner,
  DecadePeriodAligner,
  HalfDayPeriodAligner,
  HalfYearPeriodAligner,
  HeighthDayPeriodAligner,
  HourPeriodAligner,
  HundredthSecondPeriodAligner,
  MilleniaPeriodAligner,
  MillisecondPeriodAligner,
  MinutePeriodAligner,
  MonthPeriodAligner,
  PeriodAligner,
  QuarterDayPeriodAligner,
  QuarterHourPeriodAligner,
  QuarterMinutePeriodAligner,
  QuarterYearPeriodAligner,
  SecondPeriodAligner,
  TenthSecondPeriodAligner,
  TwelfthHourPeriodAligner,
  TwelfthMinutePeriodAligner,
  WeekPeriodAligner,
  YearPeriodAligner,
} from '@src/components/timeline_v2/time_axis/time_period_aligner';
import {
  dayAndLongMonthAndYearFormatter,
  dayAndLongMonthFormatter,
  dayAndShortMonthAndYearFormatter,
  dayAndShortMonthFormatter,
  dayDateTimeFormatter,
  hourAndMinuteAndSecondFormatter,
  hourAndMinuteFormatter,
  hourWithSuffixAndDayAndMonthTimeFormatter,
  hourWithSuffixTimeFormatter,
  longMonthAndYearFormatter,
  longMonthDateTimeFormatter,
  millisecondFormatter,
  minuteDateTimeFormatter,
  noZeroHourTimeFormatter,
  noZeroMinuteTimeFormatter,
  PeriodFormatter,
  shortMonthAndYearFormatter,
  shortMonthDateTimeFormatter,
  shortYearDateTimeFormatter,
  weekFormatter,
  yearDateTimeFormatter,
} from '@src/components/timeline_v2/time_axis/time_period_formatter';

export interface TimePeriod {
  name: string;
  aligner: PeriodAligner;
  formatters: PeriodFormatter[];
}

export function noText(timePeriod: TimePeriod): TimePeriod {
  const {name, aligner} = timePeriod;
  return {name, aligner, formatters: [() => '']};
}

export const MilleniaTimePeriod: TimePeriod = {
  name: 'MilleniaTimePeriod',
  aligner: MilleniaPeriodAligner,
  formatters: [yearDateTimeFormatter],
};

export const CenturyTimePeriod: TimePeriod = {
  name: 'CenturyTimePeriod',
  aligner: CenturyPeriodAligner,
  formatters: [yearDateTimeFormatter],
};

export const DecadeTimePeriod: TimePeriod = {
  name: 'DecadeTimePeriod',
  aligner: DecadePeriodAligner,
  formatters: [yearDateTimeFormatter],
};

export const ShortDecadeTimePeriod: TimePeriod = {
  name: 'DecadeTimePeriod',
  aligner: DecadePeriodAligner,
  formatters: [shortYearDateTimeFormatter],
};

export const YearTimePeriod: TimePeriod = {
  name: 'YearTimePeriod',
  aligner: YearPeriodAligner,
  formatters: [yearDateTimeFormatter],
};

export const ShortYearTimePeriod: TimePeriod = {
  name: 'ShortYearTimePeriod',
  aligner: YearPeriodAligner,
  formatters: [shortYearDateTimeFormatter],
};

export const HalfYearTimePeriod: TimePeriod = {
  name: 'HalfYearTimePeriod',
  aligner: HalfYearPeriodAligner,
  formatters: [shortMonthDateTimeFormatter],
};

export const QuarterYearTimePeriod: TimePeriod = {
  name: 'QuarterYearTimePeriod',
  aligner: QuarterYearPeriodAligner,
  formatters: [shortMonthDateTimeFormatter],
};

export const MonthTimePeriod: TimePeriod = {
  name: 'MonthTimePeriod',
  aligner: MonthPeriodAligner,
  formatters: [longMonthDateTimeFormatter, shortMonthDateTimeFormatter],
};

export const MonthAndYearTimePeriod: TimePeriod = {
  name: 'MonthAndYearTimePeriod',
  aligner: MonthPeriodAligner,
  formatters: [longMonthAndYearFormatter, shortMonthAndYearFormatter],
};

export const WeekTimePeriod: TimePeriod = {
  name: 'WeekTimePeriod',
  aligner: WeekPeriodAligner,
  formatters: [weekFormatter],
};

export const DayTimePeriod: TimePeriod = {
  name: 'DayTimePeriod',
  aligner: DayPeriodAligner,
  formatters: [dayDateTimeFormatter],
};

export const DayAndMonthTimePeriod: TimePeriod = {
  name: 'DayAndMonthTimePeriod',
  aligner: DayPeriodAligner,
  formatters: [dayAndLongMonthFormatter, dayAndShortMonthFormatter],
};

export const DayWithShortMonthTimePeriod: TimePeriod = {
  name: 'DayWithShortMonthTimePeriod',
  aligner: DayPeriodAligner,
  formatters: [dayAndShortMonthFormatter, dayDateTimeFormatter],
};

export const DayAndMonthAndYearTimePeriod: TimePeriod = {
  name: 'DayAndMonthAndYearTimePeriod',
  aligner: DayPeriodAligner,
  formatters: [
    dayAndLongMonthAndYearFormatter,
    dayAndShortMonthAndYearFormatter,
    dayAndShortMonthFormatter,
  ],
};

export const HalfDayTimePeriod: TimePeriod = {
  name: 'HalfDayTimePeriod',
  aligner: HalfDayPeriodAligner,
  formatters: [noZeroHourTimeFormatter],
};

export const QuarterDayTimePeriod: TimePeriod = {
  name: 'QuarterDayTimePeriod',
  aligner: QuarterDayPeriodAligner,
  formatters: [noZeroHourTimeFormatter],
};

export const HeighthDayTimePeriod: TimePeriod = {
  name: 'HeighthDayTimePeriod',
  aligner: HeighthDayPeriodAligner,
  formatters: [noZeroHourTimeFormatter],
};

export const HourTimePeriod: TimePeriod = {
  name: 'HourTimePeriod',
  aligner: HourPeriodAligner,
  formatters: [hourWithSuffixTimeFormatter],
};

export const HourWithDayAndMonthTimePeriod: TimePeriod = {
  name: 'HourWithDayAndMonthTimePeriod',
  aligner: HourPeriodAligner,
  formatters: [hourWithSuffixAndDayAndMonthTimeFormatter],
};

export const QuarterHourTimePeriod: TimePeriod = {
  name: 'QuarterHourTimePeriod',
  aligner: QuarterHourPeriodAligner,
  formatters: [noZeroMinuteTimeFormatter],
};

export const TimeAtQuarterHourTimePeriod: TimePeriod = {
  name: 'TimeAtQuarterHourTimePeriod',
  aligner: QuarterHourPeriodAligner,
  formatters: [hourAndMinuteFormatter],
};

export const TwelfthHourTimePeriod: TimePeriod = {
  name: 'TwelfthHourTimePeriod',
  aligner: TwelfthHourPeriodAligner,
  formatters: [minuteDateTimeFormatter],
};

export const TimeAtTwelfthHourTimePeriod: TimePeriod = {
  name: 'TimeAtTwelfthHourTimePeriod',
  aligner: TwelfthHourPeriodAligner,
  formatters: [hourAndMinuteFormatter],
};

export const MinuteTimePeriod: TimePeriod = {
  name: 'MinuteTimePeriod',
  aligner: MinutePeriodAligner,
  formatters: [minuteDateTimeFormatter],
};

export const MinuteWithHoursTimePeriod: TimePeriod = {
  name: 'MinuteTimePeriod',
  aligner: MinutePeriodAligner,
  formatters: [hourAndMinuteFormatter],
};

export const QuarterMinuteTimePeriod: TimePeriod = {
  name: 'QuarterMinuteTimePeriod',
  aligner: QuarterMinutePeriodAligner,
  formatters: [hourAndMinuteAndSecondFormatter],
};

export const TwelfthMinuteTimePeriod: TimePeriod = {
  name: 'TwelfthMinuteTimePeriod',
  aligner: TwelfthMinutePeriodAligner,
  formatters: [hourAndMinuteAndSecondFormatter],
};

export const SecondTimePeriod: TimePeriod = {
  name: 'SecondTimePeriod',
  aligner: SecondPeriodAligner,
  formatters: [hourAndMinuteAndSecondFormatter],
};

export const SecondWithMinutesAndHoursTimePeriod: TimePeriod = {
  name: 'SecondTimePeriod',
  aligner: SecondPeriodAligner,
  formatters: [hourAndMinuteAndSecondFormatter],
};

export const TenthSecondTimePeriod: TimePeriod = {
  name: 'TenthSecondTimePeriod',
  aligner: TenthSecondPeriodAligner,
  formatters: [millisecondFormatter],
};

export const HundredthSecondTimePeriod: TimePeriod = {
  name: 'HundredthSecondTimePeriod',
  aligner: HundredthSecondPeriodAligner,
  formatters: [millisecondFormatter],
};

export const MillisecondTimePeriod: TimePeriod = {
  name: 'TenthSecondTimePeriod',
  aligner: MillisecondPeriodAligner,
  formatters: [millisecondFormatter],
};
