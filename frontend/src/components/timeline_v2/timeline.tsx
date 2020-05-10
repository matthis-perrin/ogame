import React, {FC, useCallback, useRef, useState} from 'react';
import styled from 'styled-components';

import {buildItemToString} from '@shared/lib/build_items';
import {AccountTimeline} from '@shared/models/timeline';
import {substract} from '@shared/utils/type_utils';

import {Canvas} from '@src/components/core/canvas';
import {LinearTimeScale, SquareTimeScale} from '@src/components/timeline_v2/scale';
import {getTimelinePosition, positionToPercent} from '@src/components/timeline_v2/time';
import {TimeAxis} from '@src/components/timeline_v2/time_axis/time_axis';
import {AllTimePeriodGroups} from '@src/components/timeline_v2/time_axis/time_period_group';
import {getTimelineEvents} from '@src/components/timeline_v2/timeline_events';
import {getTimelineTracks} from '@src/components/timeline_v2/timeline_tracks';

export const Timeline: FC<{accountTimeline: AccountTimeline}> = ({accountTimeline}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);
  const [lastMouseDownPosition, setLastMouseDownPosition] = useState<number>();
  const unconstrainedZoom = false;
  const unconstrainedOffset = false;

  // eslint-disable-next-line no-null/no-null
  const timeAxisRef = useRef<TimeAxis | null>(null);

  const renderCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, data) => {
      const min = new Date(2022, 3, 12, 14, 43, 56, 123);
      const max = new Date(2023, 6, 13, 20, 12, 45, 478);

      // const scale = new SquareTimeScale(min, max);
      const scale = new LinearTimeScale();

      const scaledSize = scale.getX(max) - scale.getX(min); // Total size on the scale
      const startOnScale = scale.getX(min) + offset * scaledSize;
      const endOnScale = startOnScale + scaledSize / zoom;
      const startDate = scale.fromX(startOnScale);
      const endDate = scale.fromX(endOnScale);

      let timeAxis: TimeAxis | undefined;
      if (!timeAxisRef.current) {
        timeAxis = new TimeAxis({
          scale,
          timePeriodGroups: AllTimePeriodGroups,
          options: {
            ticks: {
              line: {strokeStyle: '#ffffff'},
              text: {fillStyle: '#aaaaaa'},
            },
            group: {
              line: {strokeStyle: '#ffffff'},
              text: {fillStyle: '#ffffff'},
            },
          },
        });
        timeAxisRef.current = timeAxis;
      } else {
        timeAxis = timeAxisRef.current;
      }

      const t1 = Date.now();
      try {
        const y = height - 24 - 32 - 32;
        timeAxis.drawTimeAxis(ctx, {x: 0, y, width, height}, startDate, endDate);
      } catch (err) {
        console.log('Failed', err);
      }
      console.log(`${Date.now() - t1} ms`);
    },
    [offset, zoom]
  );

  function handleMouseWheel(event: React.WheelEvent<HTMLDivElement>): void {
    let newZoom = event.deltaY > 0 ? zoom / 1.1 : zoom * 1.1;
    if (!unconstrainedZoom) {
      newZoom = Math.max(1, newZoom);
    }

    const {left, width} = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - left) / width;

    let newOffset = offset + normalizedX / zoom - normalizedX / newZoom;
    if (!unconstrainedOffset) {
      newOffset = Math.min(1 - 1 / zoom, Math.max(0, newOffset));
    }

    setZoom(newZoom);
    setOffset(newOffset);
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>): void {
    setLastMouseDownPosition(event.clientX);
  }
  function handleMouseUp(event: React.MouseEvent<HTMLDivElement>): void {
    setLastMouseDownPosition(undefined);
  }
  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>): void {
    if (lastMouseDownPosition !== undefined) {
      const delta = event.clientX - lastMouseDownPosition;
      const {width} = event.currentTarget.getBoundingClientRect();
      const normalizedDelta = delta / width;
      setLastMouseDownPosition(event.clientX);
      let newOffset = offset - normalizedDelta / zoom;
      if (!unconstrainedOffset) {
        newOffset = Math.min(1 - 1 / zoom, Math.max(0, newOffset));
      }
      setOffset(newOffset);
    }
  }

  const timelineEvents = getTimelineEvents(accountTimeline);
  const timelineTracks = getTimelineTracks(timelineEvents);

  const svgElements: JSX.Element[] = [];
  for (const [trackIndex, track] of timelineTracks.entries()) {
    for (const {start, end, buildItem} of track) {
      const startPosition = getTimelinePosition(start, accountTimeline);
      const endPosition = getTimelinePosition(end, accountTimeline);
      const content = buildItemToString(buildItem);
      const height = 24;
      const padding = 4;
      svgElements.push(
        <rect
          onClick={() => console.log(content)}
          key={`${buildItem.buildable.id}:${start}->${end}`}
          x={positionToPercent(startPosition)}
          y={trackIndex * height + (trackIndex - 1) * padding}
          width={positionToPercent(substract(endPosition, startPosition))}
          height={height}
          fill="#FFFFFF33"
          stroke="#FFFFFF99"
        ></rect>
      );
    }
  }

  return (
    <TimelineWrapper
      onWheel={handleMouseWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {/* <SVGWrapper style={{width: `${zoom * 100}%`, left: `${-offset * 100}%`}}>
        {svgElements}
      </SVGWrapper> */}
      <div
        style={{position: 'absolute', top: 15, left: 5, width: 10, height: 10, background: 'blue'}}
      ></div>
      <Canvas canvasData={{zoom, offset}} draw={renderCanvas} />
    </TimelineWrapper>
  );
};
Timeline.displayName = 'Timeline';

const TimelineWrapper = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
`;

// const SVGWrapper = styled.svg`
//   position: relative;
// `;
