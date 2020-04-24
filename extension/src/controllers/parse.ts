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

/* eslint-disable no-console */
export function parseUI(): void {
  const resources = parseResources();
  if (resources === undefined) {
    return;
  }
  console.log('Resources parsed');

  const metas = parseMeta();
  const id = metas.find(_ => _.name === 'ogame-planet-id')?.content;
  const timestamp = metas.find(_ => _.name === 'ogame-timestamp')?.content;
  if (id === undefined || timestamp === undefined) {
    return;
  }
  const planetId = id.toString() as PlanetId;
  const serverTimeSeconds = parseFloat(timestamp);
  console.log(`Meta parsed ${metas.length}`);

  const planets = parsePlanets();
  if (planets.length === 0) {
    return;
  }
  console.log(`Planets parsed ${planets.length}`);

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
    console.log(`Technologies parsed ${technologies.length}`);
  } else if (shouldParseShips) {
    ships = parseTechnologies();
    console.log(`Ships parsed ${ships.length}`);
  }

  const fleets = parseFleets();
  console.log(`Fleets parsed ${fleets.length}`);

  parseMessages()
    .then(messages => {
      if (messages !== undefined) {
        console.log(`Messages parsed ${messages.length}`);
      }

      console.log('OK');

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
    .catch(err => {
      console.error(err);
    });
}
