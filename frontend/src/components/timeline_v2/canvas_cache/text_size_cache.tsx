interface TextSize {
  width: number;
  height: number;
}

export class TextSizeCache {
  private readonly measureCache = new Map<string, TextSize>();
  private ctx: CanvasRenderingContext2D | undefined;

  public setContext(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
  }

  public getSize(font: string, text: string): TextSize {
    if (!this.ctx) {
      throw new Error('Context not set');
    }

    const size = this.measureCache.get(font + text);
    if (size !== undefined) {
      return size;
    }

    this.ctx.save();
    this.ctx.font = font;
    const {width, actualBoundingBoxAscent, actualBoundingBoxDescent} = this.ctx.measureText(text);
    this.ctx.restore();

    const newSize = {
      width,
      height: actualBoundingBoxAscent - actualBoundingBoxDescent,
    };
    this.measureCache.set(font + text, newSize);
    return newSize;
  }
}
