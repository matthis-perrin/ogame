import {TECHNOLOGY_PAGES} from '@src/models/constants';
import {PlanetId} from '@src/models/planets';
import {Technology} from '@src/models/technologies';
import {parseMeta} from '@src/parsers/meta';
import {parsePlanets} from '@src/parsers/planets';
import {parseResources} from '@src/parsers/resources';
import {parseTechnologies} from '@src/parsers/technologies';
import {addPlanet} from '@src/stores/account';

/* eslint-disable no-console */
export function parseUI(): void {
  const resources = parseResources();
  if (resources === undefined) {
    return;
  }
  console.log('Resources parsed');

  const metas = parseMeta();
  const id = metas.find(_ => _.name === 'ogame-planet-id')?.content;
  if (id === undefined) {
    return;
  }
  console.log(`Meta parsed ${metas.length}`);

  const planetId = `planet-${id}` as PlanetId;
  const planets = parsePlanets();
  if (planets.length === 0) {
    return;
  }
  console.log(`Planets parsed ${planets.length}`);

  let technologies: Technology[] = [];
  let shouldParseTechnologies = false;
  for (const page of TECHNOLOGY_PAGES) {
    if (document.location.search.includes(page)) {
      shouldParseTechnologies = true;
      break;
    }
  }
  if (shouldParseTechnologies) {
    technologies = parseTechnologies();
  }

  console.log(`Technologies parsed ${technologies.length}`);

  console.log('OK');

  addPlanet(planets, planetId, resources, technologies);
}
