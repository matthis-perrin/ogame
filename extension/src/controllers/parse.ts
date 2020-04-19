import {PlanetId} from '@src/models/planets';
import {Technology} from '@src/models/technologies';
import {parseDefenses} from '@src/parsers/defenses';
import {parseFacilities} from '@src/parsers/facilities';
import {parseFleet} from '@src/parsers/fleet';
import {parseMeta} from '@src/parsers/meta';
import {parsePlanets} from '@src/parsers/planets';
import {parseResources} from '@src/parsers/resources';
import {parseSupplies} from '@src/parsers/supplies';
import {addPlanet} from '@src/stores/account';

/* eslint-disable no-console */
export function parseUI(): void {
  const resources = parseResources();
  if (resources === undefined) {
    return;
  }

  const metas = parseMeta();
  const id = metas.find(_ => _.name === 'ogame-planet-id')?.content;
  if (id === undefined) {
    return;
  }

  const planetId = `planet-${id}` as PlanetId;
  const planets = parsePlanets();

  let technologies: Technology[] = [];
  if (document.location.search.includes('component=supplies')) {
    technologies = parseSupplies();
  } else if (document.location.search.includes('component=facilities')) {
    technologies = parseFacilities();
  } else if (document.location.search.includes('component=defenses')) {
    technologies = parseDefenses();
  } else if (document.location.search.includes('component=shipyard')) {
    technologies = parseFleet();
  }

  addPlanet(planets, planetId, resources, technologies);
}
