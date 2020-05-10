import {DeepPartial, removeUndefined} from '@shared/utils/type_utils';

import {TextSizeCache} from '@src/components/timeline_v2/canvas_cache/text_size_cache';
import {Scale} from '@src/components/timeline_v2/scale';
import {
  defaultOptions,
  LineOptions,
  mergeOptions,
  TextOptions,
  TimeAxisOptions,
  TimePeriodOptions,
} from '@src/components/timeline_v2/time_axis/time_axis_options';
import {TimePeriod} from '@src/components/timeline_v2/time_axis/time_period';
import {TimePeriodGroup} from '@src/components/timeline_v2/time_axis/time_period_group';
import {
  getTextZones,
  MeasuredText,
  TimePeriodTextZone,
} from '@src/components/timeline_v2/time_axis/time_period_text_zone';

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

type TimePeriodTextZoneWithBestLabel = TimePeriodTextZone & {bestLabel: MeasuredText};

interface MeasuredTimePeriod {
  timePeriod: TimePeriod;
  allTextZones: TimePeriodTextZoneWithBestLabel[];
}

interface MeasuredGroup {
  group: TimePeriodGroup;
  measures: {
    subticks?: MeasuredTimePeriod;
    ticks: MeasuredTimePeriod;
    group: MeasuredTimePeriod;
  };
}

export interface TimeAxisConfig {
  scale: Scale<Date>;
  timePeriodGroups: TimePeriodGroup[];
  options?: DeepPartial<TimeAxisOptions>;
}

export class TimeAxis {
  private readonly textSizeCache: TextSizeCache;
  private readonly options: TimeAxisOptions;

  public constructor(private readonly config: TimeAxisConfig) {
    this.textSizeCache = new TextSizeCache();
    this.options = mergeOptions(defaultOptions, config.options ?? {});
  }

  private computeBestLabels(textZones: TimePeriodTextZone[]): TimePeriodTextZoneWithBestLabel[] {
    // Go through all text zones labels to catalog what indexes are not available
    const invalidIndexes = new Set<number>();
    let largestValidIndex = -1;
    for (const tz of textZones) {
      for (const [index, label] of tz.labels.entries()) {
        if (label === undefined) {
          if (tz.leftCut === 0 && tz.rightCut === 0) {
            invalidIndexes.add(index);
          }
        } else if (largestValidIndex === undefined || index > largestValidIndex) {
          largestValidIndex = index;
        }
      }
    }

    let smallestValidIndex: number | undefined;
    for (let i = 0; i <= largestValidIndex; i++) {
      if (!invalidIndexes.has(i)) {
        smallestValidIndex = i;
        break;
      }
    }

    if (smallestValidIndex === undefined) {
      throw new Error(`No valid label index available`);
    }

    return textZones.map(tz => ({
      ...tz,
      bestLabel: tz.labels[smallestValidIndex as number] ?? {text: '', textWidth: 0, textHeight: 0},
    }));
  }

  private getMeasuredTimePeriod(
    timePeriod: TimePeriod,
    min: Date,
    max: Date,
    width: number,
    text: TextOptions
  ): MeasuredTimePeriod | undefined {
    try {
      const allTextZones = getTextZones(
        this.config.scale,
        this.textSizeCache,
        min,
        max,
        width,
        timePeriod,
        text.font,
        text.padding
      );

      return {
        timePeriod,
        allTextZones: this.computeBestLabels(allTextZones),
      };
    } catch {
      return undefined;
    }
  }

  private getBestMeasuredTicks(
    ticks: {main: TimePeriod; sub?: TimePeriod}[],
    min: Date,
    max: Date,
    width: number,
    text: TextOptions
  ): {
    ticksMeasures: MeasuredTimePeriod | undefined;
    subticksMeasures: MeasuredTimePeriod | undefined;
  } {
    for (const {main, sub} of ticks) {
      try {
        const mainTextZones = getTextZones(
          this.config.scale,
          this.textSizeCache,
          min,
          max,
          width,
          main,
          text.font,
          text.padding
        );
        let subTextZones: TimePeriodTextZone[] | undefined;
        try {
          if (sub !== undefined) {
            subTextZones = getTextZones(
              this.config.scale,
              this.textSizeCache,
              min,
              max,
              width,
              sub,
              text.font,
              text.padding
            );
          }
        } catch {
          // Sub ticks are allowed to fail to render
        }
        return {
          ticksMeasures: {timePeriod: main, allTextZones: this.computeBestLabels(mainTextZones)},
          subticksMeasures:
            sub && subTextZones
              ? {timePeriod: sub, allTextZones: this.computeBestLabels(subTextZones)}
              : undefined,
        };
      } catch {
        continue;
      }
    }
    return {ticksMeasures: undefined, subticksMeasures: undefined};
  }

  private measureGroups(rect: Rectangle, min: Date, max: Date): MeasuredGroup[] {
    const groupsAndMeasures: MeasuredGroup[] = removeUndefined(
      this.config.timePeriodGroups.map(timePeriodGroup => {
        const {ticks, group} = timePeriodGroup;

        const {ticksMeasures, subticksMeasures} = this.getBestMeasuredTicks(
          ticks,
          min,
          max,
          rect.width,
          this.options.ticks.text
        );
        if (ticksMeasures === undefined) {
          return undefined;
        }

        const groupMeasures = this.getMeasuredTimePeriod(
          group,
          min,
          max,
          rect.width,
          this.options.group.text
        );
        if (!groupMeasures) {
          return undefined;
        }

        const measuredGroup: MeasuredGroup = {
          group: timePeriodGroup,
          measures: {
            subticks: subticksMeasures,
            ticks: ticksMeasures,
            group: groupMeasures,
          },
        };
        // console.log(timePeriodGroup.name, true);
        return measuredGroup;
      })
    );
    // console.log('----');

    return groupsAndMeasures;
  }

  private applyLineOptions(ctx: CanvasRenderingContext2D, lineOptions: LineOptions): void {
    ctx.strokeStyle = lineOptions.strokeStyle;

    ctx.lineCap = lineOptions.lineCap;
    ctx.lineDashOffset = lineOptions.lineDashOffset;
    ctx.lineJoin = lineOptions.lineJoin;
    ctx.lineWidth = lineOptions.lineWidth;
    ctx.miterLimit = lineOptions.miterLimit;

    ctx.shadowBlur = lineOptions.shadowBlur;
    ctx.shadowColor = lineOptions.shadowColor;
    ctx.shadowOffsetX = lineOptions.shadowOffsetX;
    ctx.shadowOffsetY = lineOptions.shadowOffsetY;
  }

  private applyTextOptions(ctx: CanvasRenderingContext2D, textOptions: TextOptions): void {
    ctx.font = textOptions.font;
    ctx.fillStyle = textOptions.fillStyle;
  }

  private renderTextZones(
    ctx: CanvasRenderingContext2D,
    measuredTimePeriod: MeasuredTimePeriod | undefined,
    options: TimePeriodOptions,
    renderer: (
      ctx: CanvasRenderingContext2D,
      textZone: TimePeriodTextZoneWithBestLabel,
      height: number
    ) => void,
    noTranslate?: boolean
  ): void {
    ctx.save();
    this.applyTextOptions(ctx, options.text);
    this.applyLineOptions(ctx, options.line);
    if (measuredTimePeriod?.allTextZones) {
      for (const textZone of measuredTimePeriod.allTextZones) {
        renderer(ctx, textZone, options.height);
      }
    }
    ctx.restore();
    if (!noTranslate) {
      ctx.translate(0, options.height);
    }
  }

  private renderTextZoneRectangle(
    ctx: CanvasRenderingContext2D,
    textZone: TimePeriodTextZone,
    height: number
  ): void {
    const zoneWidth = textZone.end - textZone.start;

    type Corner = [number, number];
    const topLeft: Corner = [textZone.start, 0];
    const topRight: Corner = [textZone.start + zoneWidth, 0];
    const bottomRight: Corner = [textZone.start + zoneWidth, height];
    const bottomLeft: Corner = [textZone.start, height];

    ctx.beginPath();
    ctx.moveTo.apply(ctx, topLeft);
    ctx.lineTo.apply(ctx, topRight);
    if (textZone.rightCut > 0) {
      ctx.moveTo.apply(ctx, bottomRight);
    } else {
      ctx.lineTo.apply(ctx, bottomRight);
    }
    ctx.lineTo.apply(ctx, bottomLeft);
    if (textZone.leftCut > 0) {
      ctx.moveTo.apply(ctx, topLeft);
    } else {
      ctx.lineTo.apply(ctx, topLeft);
    }
    ctx.stroke();
  }

  public drawTimeAxis(ctx: CanvasRenderingContext2D, rect: Rectangle, min: Date, max: Date): void {
    this.textSizeCache.setContext(ctx);
    const groups = this.measureGroups(rect, min, max);
    const bestGroup = groups[groups.length - 1];
    const {subticks, ticks, group} = bestGroup.measures;

    ctx.save();
    ctx.translate(rect.x, rect.y);

    // Subticks
    this.renderTextZones(
      ctx,
      subticks,
      this.options.ticks,
      (ctx, textZone, height) => {
        ctx.beginPath();
        ctx.moveTo(textZone.start, height - this.options.subticksHeight);
        ctx.lineTo(textZone.start, height);
        ctx.stroke();
      },
      true
    );

    // Ticks text
    this.renderTextZones(ctx, ticks, this.options.ticks, (ctx, textZone, height) => {
      const label = textZone.bestLabel;

      const x = textZone.start - label.textWidth / 2;
      if (x >= 0 && x + label.textWidth <= rect.width - rect.x) {
        ctx.fillText(
          label.text,
          x,
          height - this.options.ticks.text.padding - (height - label.textHeight) / 2
        );
      }

      ctx.beginPath();
      ctx.moveTo(textZone.start, height - this.options.ticksHeight);
      ctx.lineTo(textZone.start, height);
      ctx.stroke();
    });

    // Group text
    this.renderTextZones(ctx, group, this.options.group, (ctx, textZone, height) => {
      const {end, start, bestLabel} = textZone;
      const {text, textHeight, textWidth} = bestLabel;

      const x = start + (end - start - textWidth) / 2;
      if (end - start >= textWidth + this.options.group.text.padding) {
        ctx.fillText(text, x, height - (height - textHeight) / 2);
      }

      this.renderTextZoneRectangle(ctx, textZone, height);
    });

    ctx.restore();
  }
}
