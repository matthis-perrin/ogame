import {BuildableBase} from '@shared/models/buildable';
import {makeResources, Resources} from '@shared/models/resource';

export interface Stock extends BuildableBase {
  readonly type: 'stock';
  readonly cost: Resources;
}

export const Metal: Stock = {
  id: 1000,
  name: 'Métal',
  shortName: 'Métal',
  type: 'stock',
  requirements: [],
  component: 'overview',
  sprite: '',
  cost: makeResources({m: 1, c: 0, d: 0}),
};

export const Crystal: Stock = {
  id: 1001,
  name: 'Cristal',
  shortName: 'Cristal',
  type: 'stock',
  requirements: [],
  component: 'overview',
  sprite: '',
  cost: makeResources({m: 0, c: 1, d: 0}),
};

export const Deuterium: Stock = {
  id: 1002,
  name: 'Deutérium',
  shortName: 'Deutérium',
  type: 'stock',
  requirements: [],
  component: 'overview',
  sprite: '',
  cost: makeResources({m: 0, c: 0, d: 1}),
};

export const AllStocks: Stock[] = [Metal, Crystal, Deuterium];
