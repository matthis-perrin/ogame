import {PAGES_SHIPS, PAGES_TECHNOLOGIES, UI_REFRESH_RATE} from '@src/models/constants';
import {PlanetId} from '@src/models/planets';
import {Technology} from '@src/models/technologies';
import {parseFleets} from '@src/parsers/fleets';
import {parseMessages} from '@src/parsers/messages';
import {parseMeta} from '@src/parsers/meta';
import {parsePlanets} from '@src/parsers/planets';
import {parseResources} from '@src/parsers/resources';
import {parseTechnologies} from '@src/parsers/technologies';
import {addPlanet} from '@src/stores/account/planet';
import {applyProduction} from '@src/stores/account/production';

export function parseUI(): void {
  const resources = parseResources();
  if (resources === undefined) {
    return;
  }

  const metas = parseMeta();
  const id = metas.find(_ => _.name === 'ogame-planet-id')?.content;
  const timestamp = metas.find(_ => _.name === 'ogame-timestamp')?.content;
  if (id === undefined || timestamp === undefined) {
    return;
  }
  const planetId = id.toString() as PlanetId;
  const serverTimeSeconds = parseFloat(timestamp);

  const planets = parsePlanets();
  if (planets.length === 0) {
    return;
  }

  let technologies: Technology[] = [];
  let ships: Technology[] | undefined;
  let shouldParseTechnologies = false;
  let shouldParseShips = false;
  for (const page of PAGES_TECHNOLOGIES) {
    if (document.location.search.includes(page)) {
      shouldParseTechnologies = true;
      break;
    }
  }
  for (const page of PAGES_SHIPS) {
    if (document.location.search.includes(page)) {
      shouldParseShips = true;
      break;
    }
  }
  if (shouldParseTechnologies) {
    technologies = parseTechnologies();
  } else if (shouldParseShips) {
    ships = parseTechnologies();
  }

  const fleets = parseFleets();

  parseMessages()
    .then(messages => {
      addPlanet(
        serverTimeSeconds,
        planets,
        planetId,
        resources,
        technologies,
        ships,
        fleets,
        messages
      );

      setInterval(applyProduction, UI_REFRESH_RATE);
    })
    // eslint-disable-next-line no-console
    .catch(console.error);
}
