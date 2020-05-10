import {
  CenturyTimePeriod,
  DayAndMonthAndYearTimePeriod,
  DayAndMonthTimePeriod,
  DayTimePeriod,
  DayWithShortMonthTimePeriod,
  DecadeTimePeriod,
  HalfDayTimePeriod,
  HalfYearTimePeriod,
  HeighthDayTimePeriod,
  HourTimePeriod,
  HundredthSecondTimePeriod,
  MilleniaTimePeriod,
  MillisecondTimePeriod,
  MinuteTimePeriod,
  MinuteWithHoursTimePeriod,
  MonthAndYearTimePeriod,
  MonthTimePeriod,
  noText,
  QuarterDayTimePeriod,
  QuarterHourTimePeriod,
  QuarterMinuteTimePeriod,
  QuarterYearTimePeriod,
  SecondTimePeriod,
  SecondWithMinutesAndHoursTimePeriod,
  ShortDecadeTimePeriod,
  ShortYearTimePeriod,
  TenthSecondTimePeriod,
  TimeAtQuarterHourTimePeriod,
  TimeAtTwelfthHourTimePeriod,
  TimePeriod,
  TwelfthHourTimePeriod,
  TwelfthMinuteTimePeriod,
  WeekTimePeriod,
  YearTimePeriod,
} from '@src/components/timeline_v2/time_axis/time_period';

export interface TimePeriodGroup {
  name: string;
  ticks: {main: TimePeriod; sub?: TimePeriod}[];
  group: TimePeriod;
}

const MilleniaTimePeriodGroup: TimePeriodGroup = {
  name: 'MilleniaTimePeriodGroup',
  ticks: [
    {main: CenturyTimePeriod, sub: noText(DecadeTimePeriod)},
    {main: noText(CenturyTimePeriod), sub: noText(DecadeTimePeriod)},
    {main: noText(MilleniaTimePeriod)},
  ],
  group: MilleniaTimePeriod,
};

const CenturyTimePeriodGroup: TimePeriodGroup = {
  name: 'CenturyTimePeriodGroup',
  ticks: [
    {main: DecadeTimePeriod, sub: noText(YearTimePeriod)},
    {main: ShortDecadeTimePeriod, sub: noText(YearTimePeriod)},
    {main: noText(DecadeTimePeriod), sub: noText(YearTimePeriod)},
  ],
  group: CenturyTimePeriod,
};

const DecadeTimePeriodGroup: TimePeriodGroup = {
  name: 'DecadeTimePeriodGroup',
  ticks: [{main: YearTimePeriod}, {main: ShortYearTimePeriod}, {main: noText(YearTimePeriod)}],
  group: DecadeTimePeriod,
};

const YearTimePeriodGroup: TimePeriodGroup = {
  name: 'YearTimePeriodGroup',
  ticks: [
    {main: MonthTimePeriod},
    {main: QuarterYearTimePeriod, sub: noText(MonthTimePeriod)},
    {main: HalfYearTimePeriod, sub: noText(MonthTimePeriod)},
    {main: HalfYearTimePeriod, sub: noText(QuarterYearTimePeriod)},
    {main: noText(HalfYearTimePeriod)},
  ],
  group: YearTimePeriod,
};

const MonthTimePeriodGroup: TimePeriodGroup = {
  name: 'MonthTimePeriodGroup',
  ticks: [
    {main: DayWithShortMonthTimePeriod, sub: noText(HalfDayTimePeriod)},
    {main: WeekTimePeriod, sub: noText(DayTimePeriod)},
  ],
  group: MonthAndYearTimePeriod,
};

const DayTimePeriodGroup: TimePeriodGroup = {
  name: 'DayTimePeriodGroup',
  ticks: [
    {main: SecondWithMinutesAndHoursTimePeriod, sub: noText(TenthSecondTimePeriod)},
    {main: TwelfthMinuteTimePeriod, sub: noText(SecondTimePeriod)},
    {main: QuarterMinuteTimePeriod, sub: noText(TwelfthMinuteTimePeriod)},
    {main: MinuteWithHoursTimePeriod, sub: noText(QuarterMinuteTimePeriod)},
    {main: TimeAtTwelfthHourTimePeriod, sub: noText(MinuteTimePeriod)},
    {main: TimeAtQuarterHourTimePeriod, sub: noText(TwelfthHourTimePeriod)},
    {main: HourTimePeriod, sub: noText(QuarterHourTimePeriod)},
    {main: HeighthDayTimePeriod, sub: noText(HourTimePeriod)},
  ],
  group: DayAndMonthAndYearTimePeriod,
};

// const MinuteTimePeriodGroup: TimePeriodGroup = {
//   name: 'MinuteTimePeriodGroup',
//   ticks: [
//     {main: SecondWithMinutesAndHoursTimePeriod, sub: noText(TenthSecondTimePeriod)},
//     {main: SecondTimePeriod, sub: noText(TenthSecondTimePeriod)},
//     {main: TwelfthMinuteTimePeriod, sub: noText(SecondTimePeriod)},
//   ],
//   group: MinuteWithHoursTimePeriod,
// };

const SecondTimePeriodGroup: TimePeriodGroup = {
  name: 'SecondTimePeriodGroup',
  ticks: [
    {main: MillisecondTimePeriod},
    {main: HundredthSecondTimePeriod, sub: noText(MillisecondTimePeriod)},
    {main: TenthSecondTimePeriod, sub: noText(MillisecondTimePeriod)},
  ],
  group: SecondWithMinutesAndHoursTimePeriod,
};

export const AllTimePeriodGroups = [
  MilleniaTimePeriodGroup,
  CenturyTimePeriodGroup,
  DecadeTimePeriodGroup,
  YearTimePeriodGroup,
  MonthTimePeriodGroup,
  DayTimePeriodGroup,
  // MinuteTimePeriodGroup,
  SecondTimePeriodGroup,
];
