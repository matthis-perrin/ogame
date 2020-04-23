export function updateReadonlyMap<Key, Value>(
  map: ReadonlyMap<Key, Value>,
  key: Key,
  value: Value
): ReadonlyMap<Key, Value> {
  if (map.has(key)) {
    return new Map(Array.from(map.entries()).map(([k, v]) => [k, k === key ? value : v]));
  } else {
    return new Map([...Array.from(map.entries()), [key, value]]);
  }
}
