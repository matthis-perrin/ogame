import $ from 'jquery';

import {Planet, PlanetCoords, PlanetId, PlanetName} from '@src/models/planets';

const titleRegex = /<br\/>.*km \((\d+)\/(\d+)\)<br>(-?\d+) °C à (-?\d+)°C<br\/>/;

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
    const match = titleRegex.exec(title);
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
      usedSpace: parseFloat(match[1]),
      totalSpace: parseFloat(match[2]),
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      tempLow: parseFloat(match[3]),
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      tempHigh: parseFloat(match[4]),
    });
  });
  return res;
}
