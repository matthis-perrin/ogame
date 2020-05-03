import {readFileSync, writeFileSync} from 'fs';

const fileName = 'storage.txt';

interface Storage {
  [key: string]: string;
}

function read(): Storage {
  try {
    return JSON.parse(readFileSync(fileName).toString()) as Storage;
  } catch {
    return {};
  }
}

function write(storage: Storage): void {
  try {
    writeFileSync(fileName, JSON.stringify(storage));
    // eslint-disable-next-line no-empty
  } catch {}
}

export function set(key: string, data: string): void {
  const storage = read();
  storage[key] = data;
  write(storage);
}

export function get(key: string): string | null {
  const storage = read();
  if (!storage.hasOwnProperty(key)) {
    // eslint-disable-next-line no-null/no-null
    return null;
  }
  return storage[key];
}
