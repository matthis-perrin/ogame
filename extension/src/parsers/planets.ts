import $ from 'jquery';

import {Planet, PlanetCoords, PlanetId, PlanetName} from '@src/models/planets';

const temperatureRegex = /<br>(-?\d+) °C à (-?\d+)°C<br\/>/;

export function parsePlanets(): Planet[] {
  const res: Planet[] = [];
  $('html > body #planetList > div').each((_, element) => {
    if (element.id.length === 0) {
      return;
    }
    const title = $(element)
      .find('a.planetlink[title]')
      .attr('title');
    if (title === undefined) {
      return;
    }
    const match = temperatureRegex.exec(title);
    // eslint-disable-next-line no-null/no-null
    if (match === null) {
      return;
    }
    res.push({
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      id: element.id.substr(7) as PlanetId,
      name: $(element)
        .find('.planet-name')
        .text() as PlanetName,
      coords: $(element)
        .find('.planet-koords')
        .text() as PlanetCoords,
      tempLow: parseFloat(match[1]),
      tempHigh: parseFloat(match[2]),
    });
  });
  return res;
}
