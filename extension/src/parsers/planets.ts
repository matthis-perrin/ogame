import $ from 'jquery';

import {Planet, PlanetCoords, PlanetId, PlanetName} from '@src/models/planets';

export function parsePlanets(): Planet[] {
  const res: Planet[] = [];
  $('html > body #planetList > div').each((_, element) => {
    res.push({
      id: element.id as PlanetId,
      name: $(element)
        .find('.planet-name')
        .text() as PlanetName,
      coords: $(element)
        .find('.planet-koords')
        .text() as PlanetCoords,
    });
  });
  return res;
}
