/* eslint-disable @typescript-eslint/no-explicit-any */

type AnyMapOrEmpty =
  | {
      [key: string]: any;
    }
  | {};
export interface AnyMap {
  [key: string]: any;
}
export function asMap(value: any): {[key: string]: any} | undefined;
export function asMap(value: any, defaultValue: AnyMapOrEmpty): AnyMap;
export function asMap(value: any, defaultValue?: AnyMapOrEmpty): AnyMap | undefined {
  // eslint-disable-next-line no-null/no-null
  return typeof value === 'object' && value !== null ? (value as AnyMap) : defaultValue;
}

export function asArray<T = any>(value: any): T[] | undefined;
export function asArray<T = any>(value: any, defaultValue: T[]): T[];
export function asArray<T = any>(value: any, defaultValue?: T[]): T[] | undefined {
  return Array.isArray(value) ? (value as T[]) : defaultValue;
}

export function asNumber(value: any): number | undefined;
export function asNumber(value: any, defaultValue: number): number;
export function asNumber(value: any, defaultValue?: number): number | undefined {
  if (typeof value === 'number') {
    return !isNaN(value) ? value : defaultValue;
  }
  if (typeof value === 'string') {
    try {
      const parsedValue = parseFloat(value);
      return !isNaN(parsedValue) ? parsedValue : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}
export function asNumberOrThrow(value: any): number {
  const valueAsNumber = asNumber(value);
  if (valueAsNumber === undefined) {
    throw new Error(`Invalid value: \`${value}\` is not a number`);
  }
  return valueAsNumber;
}

export function asBoolean(value: any): boolean | undefined;
export function asBoolean(value: any, defaultValue: boolean): boolean;
export function asBoolean(value: any, defaultValue?: boolean): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return !isNaN(value) ? value !== 0 : false;
  }
  if (typeof value === 'string') {
    if (value === '0' || value === 'false') {
      return false;
    } else if (value === '1' || value === 'true') {
      return true;
    } else {
      return defaultValue;
    }
  }
  return defaultValue;
}

export function asString(value: any): string | undefined;
export function asString(value: any, defaultValue: string): string;
export function asString(value: any, defaultValue?: string): string | undefined {
  return typeof value === 'string' ? value : defaultValue;
}
export function asStringOrThrow(value: any): string {
  const valueAsString = asString(value);
  if (valueAsString === undefined) {
    throw new Error(`Invalid value: \`${value}\` is not a string`);
  }
  return valueAsString;
}

export function asFunction(value: any): Function | undefined;
export function asFunction(value: any, defaultValue: Function): Function;
export function asFunction(value: any, defaultValue?: Function): Function | undefined {
  return typeof value === 'function' ? (value as Function) : defaultValue;
}

export function asDate(value: any): Date | undefined;
export function asDate(value: any, defaultValue: Date): Date;
export function asDate(value: any, defaultValue?: Date): Date | undefined {
  if (typeof value === 'number') {
    return new Date(value);
  }
  return value instanceof Date ? value : defaultValue;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorAsString(err: any): string {
  const errorMap = asMap(err);
  if (errorMap === undefined) {
    const errorString = asString(err);
    if (errorString === undefined) {
      return String(err);
    }
    return errorString;
  }

  const errorMessage = asString(errorMap.message);
  if (errorMessage === undefined) {
    return String(err);
  }
  return errorMessage;
}

export function asParsedJSON<T>(json: string): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    const defaultValue = {};
    return defaultValue as T;
  }
}
export function safeParseJSON(
  json: string
): {res: unknown; err: undefined} | {res: undefined; err: unknown} {
  try {
    return {res: JSON.parse(json), err: undefined};
  } catch (err) {
    return {err, res: undefined};
  }
}

export function notUndefined<T>(val: T | undefined): val is T {
  return val !== undefined;
}

export function removeUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter(notUndefined);
}

export function neverHappens(value: never, errorMessage?: string): never {
  throw new Error(errorMessage);
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Brand<Type, Name> = Type & {__brand: Name};
export interface FlatObject {
  [key: string]: string | number | boolean | undefined;
}
export type Untrusted<T> = {
  [P in keyof T]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

// Typed number arithmetic

export function sum<T>(...args: Brand<number, T>[]): Brand<number, T> {
  let total = 0;
  for (const arg of args) {
    total += arg;
  }
  return total as Brand<number, T>;
}
export function substract<T>(a: Brand<number, T>, b: Brand<number, T>): Brand<number, T> {
  return (a - b) as Brand<number, T>;
}
export function multiply<T>(value: Brand<number, T>, times: number): Brand<number, T> {
  return (value * times) as Brand<number, T>;
}
export function divide<T>(value: Brand<number, T>, divider: number): Brand<number, T> {
  return (value / divider) as Brand<number, T>;
}
export function floor<T>(value: Brand<number, T>): Brand<number, T> {
  return Math.floor(value) as Brand<number, T>;
}
export function ceil<T>(value: Brand<number, T>): Brand<number, T> {
  return Math.ceil(value) as Brand<number, T>;
}
export function min<T>(...args: Brand<number, T>[]): Brand<number, T> {
  return Math.min(...args) as Brand<number, T>;
}
export function max<T>(...args: Brand<number, T>[]): Brand<number, T> {
  return Math.max(...args) as Brand<number, T>;
}
