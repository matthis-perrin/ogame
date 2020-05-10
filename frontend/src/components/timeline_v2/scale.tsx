export abstract class Scale<Data> {
  public abstract getX(data: Data): number;
  public abstract fromX(x: number): Data;
}

export class LinearTimeScale extends Scale<Date> {
  public getX(date: Date): number {
    return date.getTime();
  }

  public fromX(x: number): Date {
    return new Date(x);
  }
}

export class SquareTimeScale extends Scale<Date> {
  public constructor(private readonly min: Date, private readonly max: Date) {
    super();
  }

  public getX(date: Date): number {
    const normalizedMax = this.max.getTime() - this.min.getTime();
    const normalizedTime = date.getTime() - this.min.getTime();
    if (normalizedTime === 0) {
      return 0;
    }
    return Math.sqrt(normalizedTime) / Math.sqrt(normalizedMax);
  }

  public fromX(x: number): Date {
    return new Date(x * x * (this.max.getTime() - this.min.getTime()) + this.min.getTime());
  }
}
