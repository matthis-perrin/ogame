import {
  dayHalves,
  dayHeights,
  dayQuarters,
  daysInWeek,
  firstDayOfTheWeek,
  hourQuarters,
  hourTwelves,
  minuteQuarters,
  minuteTwelves,
  secondTenths,
  yearHalves,
  yearQuarters,
} from '@src/components/timeline_v2/time_axis/time_constants';

export interface PeriodAligner {
  current: (date: Date) => Date;
  next: (date: Date) => Date;
}

// Decade, century, millenia

export const MilleniaPeriodAligner: PeriodAligner = {
  current: date => new Date(1000 * Math.floor(date.getFullYear() / 1000), 0),
  next: date => new Date(1000 * (1 + Math.floor(date.getFullYear() / 1000)), 0),
};

export const CenturyPeriodAligner: PeriodAligner = {
  current: date => new Date(100 * Math.floor(date.getFullYear() / 100), 0),
  next: date => new Date(100 * (1 + Math.floor(date.getFullYear() / 100)), 0),
};

export const DecadePeriodAligner: PeriodAligner = {
  current: date => new Date(10 * Math.floor(date.getFullYear() / 10), 0),
  next: date => new Date(10 * (1 + Math.floor(date.getFullYear() / 10)), 0),
};

// Year & Year fractions

export const YearPeriodAligner: PeriodAligner = {
  current: date => new Date(date.getFullYear(), 0),
  next: date => new Date(date.getFullYear() + 1, 0),
};

function currentYearFraction(date: Date, yearFraction: number[]): Date {
  const year = date.getFullYear();
  for (let index = 0; index < yearFraction.length - 1; index++) {
    const current = yearFraction[index];
    const next = yearFraction[index + 1];
    if (date.getMonth() >= next) {
      continue;
    }
    return new Date(year, current);
  }
  return new Date(year, yearFraction[yearFraction.length - 1]);
}
function nextYearFraction(date: Date, yearFraction: number[]): Date {
  const year = date.getFullYear();
  for (let index = 1; index < yearFraction.length; index++) {
    const month = yearFraction[index];
    if (date.getMonth() < month) {
      return new Date(year, month);
    }
  }
  return new Date(year + 1, yearFraction[0]);
}

export const HalfYearPeriodAligner: PeriodAligner = {
  current: date => currentYearFraction(date, yearHalves),
  next: date => nextYearFraction(date, yearHalves),
};

export const QuarterYearPeriodAligner: PeriodAligner = {
  current: date => currentYearFraction(date, yearQuarters),
  next: date => nextYearFraction(date, yearQuarters),
};

// Month

export const MonthPeriodAligner: PeriodAligner = {
  current: date => new Date(date.getFullYear(), date.getMonth()),
  next: date => new Date(date.getFullYear(), date.getMonth() + 1),
};

// Week

export const WeekPeriodAligner: PeriodAligner = {
  current: date => {
    const currentWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - ((date.getDay() + daysInWeek - firstDayOfTheWeek) % daysInWeek)
    );
    // console.log(date, currentWeek);
    return currentWeek;
  },
  next: date => {
    const nextWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + daysInWeek - ((date.getDay() + daysInWeek - firstDayOfTheWeek) % daysInWeek)
    );
    // console.log(date, nextWeek);
    return nextWeek;
  },
};

// Day and Day fractions

export const DayPeriodAligner: PeriodAligner = {
  current: date => new Date(date.getFullYear(), date.getMonth(), date.getDate()),
  next: date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
};

function currentDayFraction(date: Date, dayFractions: number[]): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  for (let index = 0; index < dayFractions.length - 1; index++) {
    const current = dayFractions[index];
    const next = dayFractions[index + 1];
    if (date.getHours() >= next) {
      continue;
    }
    return new Date(year, month, day, current);
  }
  return new Date(year, month, day, dayFractions[dayFractions.length - 1]);
}
function nextDayFraction(date: Date, dayFractions: number[]): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  for (let index = 1; index < dayFractions.length; index++) {
    const hour = dayFractions[index];
    if (date.getHours() < hour) {
      return new Date(year, month, day, hour);
    }
  }
  return new Date(year, month, day + 1, dayFractions[0]);
}

export const HalfDayPeriodAligner: PeriodAligner = {
  current: date => currentDayFraction(date, dayHalves),
  next: date => nextDayFraction(date, dayHalves),
};

export const QuarterDayPeriodAligner: PeriodAligner = {
  current: date => currentDayFraction(date, dayQuarters),
  next: date => nextDayFraction(date, dayQuarters),
};

export const HeighthDayPeriodAligner: PeriodAligner = {
  current: date => currentDayFraction(date, dayHeights),
  next: date => nextDayFraction(date, dayHeights),
};

// Hour & Hour fractions

export const HourPeriodAligner: PeriodAligner = {
  current: date => new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()),
  next: date => new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1),
};

function currentHourFraction(date: Date, hourFractions: number[]): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  for (let index = 0; index < hourFractions.length - 1; index++) {
    const current = hourFractions[index];
    const next = hourFractions[index + 1];
    if (date.getMinutes() >= next) {
      continue;
    }
    return new Date(year, month, day, hour, current);
  }
  return new Date(year, month, day, hour, hourFractions[hourFractions.length - 1]);
}
function nextHourFraction(date: Date, hourFractions: number[]): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  for (let index = 1; index < hourFractions.length; index++) {
    const minute = hourFractions[index];
    if (date.getMinutes() < minute) {
      return new Date(year, month, day, hour, minute);
    }
  }
  return new Date(year, month, day, hour + 1, hourFractions[0]);
}

export const QuarterHourPeriodAligner: PeriodAligner = {
  current: date => currentHourFraction(date, hourQuarters),
  next: date => nextHourFraction(date, hourQuarters),
};

export const TwelfthHourPeriodAligner: PeriodAligner = {
  current: date => currentHourFraction(date, hourTwelves),
  next: date => nextHourFraction(date, hourTwelves),
};

// Minute & Minute fractions

export const MinutePeriodAligner: PeriodAligner = {
  current: date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes()
    ),
  next: date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes() + 1
    ),
};

function currentMinuteFraction(date: Date, minuteFractions: number[]): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  for (let index = 0; index < minuteFractions.length - 1; index++) {
    const current = minuteFractions[index];
    const next = minuteFractions[index + 1];
    if (date.getSeconds() >= next) {
      continue;
    }
    return new Date(year, month, day, hour, minute, current);
  }
  return new Date(year, month, day, hour, minute, minuteFractions[minuteFractions.length - 1]);
}
function nextMinuteFraction(date: Date, minuteFractions: number[]): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  for (let index = 1; index < minuteFractions.length; index++) {
    const second = minuteFractions[index];
    if (date.getSeconds() < second) {
      return new Date(year, month, day, hour, minute, second);
    }
  }
  return new Date(year, month, day, hour, minute + 1, minuteFractions[0]);
}

export const QuarterMinutePeriodAligner: PeriodAligner = {
  current: date => currentMinuteFraction(date, minuteQuarters),
  next: date => nextMinuteFraction(date, minuteQuarters),
};

export const TwelfthMinutePeriodAligner: PeriodAligner = {
  current: date => currentMinuteFraction(date, minuteTwelves),
  next: date => nextMinuteFraction(date, minuteTwelves),
};

// Second & Second fractions

export const SecondPeriodAligner: PeriodAligner = {
  current: date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  next: date =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds() + 1
    ),
};

function currentSecondFraction(date: Date, secondFractions: number[]): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  for (let index = 0; index < secondFractions.length - 1; index++) {
    const current = secondFractions[index];
    const next = secondFractions[index + 1];
    if (date.getMilliseconds() >= next) {
      continue;
    }
    return new Date(year, month, day, hour, minute, second, current);
  }
  return new Date(
    year,
    month,
    day,
    hour,
    minute,
    second,
    secondFractions[secondFractions.length - 1]
  );
}
function nextSecondFraction(date: Date, secondFractions: number[]): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  for (let index = 1; index < secondFractions.length; index++) {
    const milliseconds = secondFractions[index];
    if (date.getMilliseconds() < milliseconds) {
      return new Date(year, month, day, hour, minute, second, milliseconds);
    }
  }
  return new Date(year, month, day, hour, minute, second + 1, secondFractions[0]);
}

export const TenthSecondPeriodAligner: PeriodAligner = {
  current: date => currentSecondFraction(date, secondTenths),
  next: date => nextSecondFraction(date, secondTenths),
};

export const HundredthSecondPeriodAligner: PeriodAligner = {
  current: date => {
    const next = new Date(date.getTime());
    next.setMilliseconds(next.getMilliseconds() - (next.getMilliseconds() % 10));
    return next;
  },
  next: date => {
    const next = new Date(date.getTime());
    next.setMilliseconds(next.getMilliseconds() - (next.getMilliseconds() % 10) + 10);
    return next;
  },
};

export const MillisecondPeriodAligner: PeriodAligner = {
  current: date => date,
  next: date => {
    const next = new Date(date.getTime());
    next.setMilliseconds(next.getMilliseconds() + 1);
    return next;
  },
};
