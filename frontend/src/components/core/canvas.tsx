import React, {useCallback, useEffect, useRef, useState} from 'react';

import {HTMLProps, NULL_REF} from '@src/components/core/react';

export function Canvas<T>(
  props: {
    canvasData: T;
    draw: (ctx: CanvasRenderingContext2D, width: number, height: number, data: T) => void;
  } & HTMLProps<HTMLCanvasElement>
): JSX.Element {
  const {canvasData, draw, ...restProps} = props;
  const [canvasSize, setCanvasSize] = useState({width: 1, height: 1});
  const canvasRef = useRef<HTMLCanvasElement>(NULL_REF);
  const isRunning = useRef<boolean>(false);

  // Handle syncing the canvas size with its parent
  const resizeCanvas = useCallback(() => {
    // If the canvas has not mounted yet, we can't resize it
    if (!canvasRef.current) {
      return;
    }

    const parent = canvasRef.current.parentElement;
    const {width, height} = canvasRef.current;
    // Should never happen
    if (!parent) {
      // eslint-disable-next-line no-console
      console.error(
        `Could not retrieve canvas parent. The canvas will not be resized (current size ${width}x${height})`
      );
      return;
    }

    // Update the canvas size if the parent size has changed
    const {clientWidth, clientHeight} = parent;
    if (clientWidth !== width || clientHeight !== height) {
      setCanvasSize({
        width: clientWidth * window.devicePixelRatio,
        height: clientHeight * window.devicePixelRatio,
      });
    }
  }, []);

  // Trigger `resizeCanvas` once then every time the browser resizes
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Handles the canvas rendering. Only called when
  // - the canvas is resized (`canvasSize` changes)
  // - the canvas data changed fromn the props (`props.canvasData` changes)
  // - a new draw function is provided (`props.draw` changes)
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) {
      return;
    }
    if (!isRunning.current) {
      const pixelRatio = window.devicePixelRatio;
      const {width, height} = ctx.canvas;
      isRunning.current = true;
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.scale(pixelRatio, pixelRatio);
      try {
        draw(ctx, width / pixelRatio, height / pixelRatio, canvasData);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
      ctx.restore();
      isRunning.current = false;
    }
  }, [canvasSize, canvasData, draw]);

  return (
    <canvas
      style={{zoom: `${100 / window.devicePixelRatio}%`}}
      width={canvasSize.width}
      height={canvasSize.height}
      {...restProps}
      ref={canvasRef}
    />
  );
}
Canvas.displayName = 'Canvas';
