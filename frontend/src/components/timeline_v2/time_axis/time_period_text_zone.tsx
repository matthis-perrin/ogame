import {TextSizeCache} from '@src/components/timeline_v2/canvas_cache/text_size_cache';
import {Scale} from '@src/components/timeline_v2/scale';
import {TimePeriod} from '@src/components/timeline_v2/time_axis/time_period';

export interface MeasuredText {
  text: string;
  textWidth: number;
  textHeight: number;
}

export interface TimePeriodTextZone {
  start: number;
  end: number;
  // How much the text zone has been cut on the left side because it starts before the min date
  leftCut: number;
  // How much the text zone has been cut on the right side because it ends after the max date
  rightCut: number;
  labels: (MeasuredText | undefined)[];
}

function sameDate(date1: Date, date2: Date): boolean {
  return date1.getTime() === date2.getTime();
}
function isBefore(date1: Date, date2: Date): boolean {
  return date1.getTime() < date2.getTime();
}
function isAfter(date1: Date, date2: Date): boolean {
  return date1.getTime() > date2.getTime();
}

export function getTextZones(
  scale: Scale<Date>,
  textSizeCache: TextSizeCache,
  min: Date,
  max: Date,
  width: number,
  timePeriod: TimePeriod,
  font: string,
  paddings: number
): TimePeriodTextZone[] {
  const {aligner, formatters} = timePeriod;
  const textZones: TimePeriodTextZone[] = [];

  const minX = scale.getX(min);
  const maxX = scale.getX(max);
  const sizeX = maxX - minX;

  // Go through all periods
  let currentPeriod = aligner.current(min);
  let nextPeriod = aligner.next(currentPeriod);

  while (currentPeriod <= max) {
    const adjustedStartX = scale.getX(isBefore(currentPeriod, min) ? min : currentPeriod);
    const adjustedEndX = scale.getX(isAfter(nextPeriod, max) ? max : nextPeriod);

    const startPx = (width * (scale.getX(currentPeriod) - minX)) / sizeX;
    const endPx = (width * (scale.getX(nextPeriod) - minX)) / sizeX;

    const adjustedStartPx = (width * (adjustedStartX - minX)) / sizeX;
    const adjustedEndPx = (width * (adjustedEndX - minX)) / sizeX;

    const baseTextZone = {
      start: adjustedStartPx,
      end: adjustedEndPx,
      leftCut: adjustedStartPx - startPx,
      rightCut: endPx - adjustedEndPx,
    };

    // Compute all possible labels and measure them.
    // We stop as soon as we've found one.
    let hasAtLeastOneLabel = false;
    const labels: (MeasuredText | undefined)[] = [];
    for (const formatter of formatters) {
      const text = formatter(currentPeriod);
      const textSize = textSizeCache.getSize(font, text);
      const paddingCount = text === '' ? 1 : 2; // Half the paddings for empty text
      if (textSize.width + paddingCount * paddings <= endPx - startPx) {
        hasAtLeastOneLabel = true;
        labels.push({text, textWidth: textSize.width, textHeight: textSize.height});
      } else {
        labels.push(undefined);
      }
    }

    // In case no possible label fits, for the texts that are not the first and last period, we fail
    if (
      !hasAtLeastOneLabel &&
      currentPeriod.getTime() >= min.getTime() &&
      nextPeriod.getTime() <= max.getTime()
    ) {
      throw new Error('Not enough space to render time period');
    }
    textZones.push({...baseTextZone, labels});

    // Advance to next period
    const newNextPeriod = aligner.next(nextPeriod);
    if (sameDate(newNextPeriod, nextPeriod)) {
      const {name} = timePeriod;
      const nextStr = nextPeriod.toLocaleString();
      const minStr = min.toLocaleString();
      const maxStr = max.toLocaleString();
      // eslint-disable-next-line no-console
      console.error(
        `Time period ${name} stuck in a loop at ${nextStr} when running between ${minStr} and ${maxStr} on ${width} px`
      );
      throw new Error('Time period stuck in a loop');
    }
    currentPeriod = nextPeriod;
    nextPeriod = newNextPeriod;
  }

  return textZones;
}
