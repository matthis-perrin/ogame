/* eslint-disable @typescript-eslint/no-magic-numbers */
import {BuildOrderItem} from '@shared/lib/build_order';
import {createPlanet, createRandomMainPlanet} from '@shared/lib/planet';
import {Account, Class} from '@shared/models/account';
import {
  CrystalMine,
  DeuteriumSynthesizer,
  FusionReactor,
  MetalMine,
  SolarPlant,
} from '@shared/models/building';
import {Crawler, SolarSatellite} from '@shared/models/ships';
import {EnergyTechnology, PlasmaTechnology, Technology} from '@shared/models/technology';
import {Rosalind, Universe} from '@shared/models/universe';

export function createNewAccount(universe: Universe): Account {
  return {
    universe,
    planets: [createRandomMainPlanet(universe)],
    technologyLevels: new Map<Technology, number>(),
    class: Class.Collector,
    officers: {
      commander: false,
      fleetAdmiral: false,
      engineer: false,
      geologist: false,
      technocrat: false,
    },
    preferences: {
      resourcesRatio: {
        metal: 2,
        crystal: 1.5,
        deuterium: 1,
      },
    },
  };
}

export function applyBuildItem(account: Account, item: BuildOrderItem): void {
  const {entity, level, planet} = item;
  if (entity.type === 'technology') {
    account.technologyLevels.set(entity, level);
  } else {
    planet.buildingLevels.set(entity, level);
  }
}

export function createBenjAccount(): Account {
  const universe = Rosalind;

  const planet1 = createPlanet({galaxy: 3, solarSystem: 470, position: 10}, 203, 37 - 20);
  planet1.buildingLevels.set(MetalMine, 20);
  planet1.buildingLevels.set(CrystalMine, 20);
  planet1.buildingLevels.set(DeuteriumSynthesizer, 16);
  planet1.buildingLevels.set(SolarPlant, 16);
  planet1.buildingLevels.set(FusionReactor, 0);
  planet1.ships.set(Crawler, 0);
  planet1.ships.set(SolarSatellite, 68);

  const planet2 = createPlanet({galaxy: 4, solarSystem: 103, position: 8}, 195, 32 - 20);
  planet2.buildingLevels.set(MetalMine, 22);
  planet2.buildingLevels.set(CrystalMine, 20);
  planet2.buildingLevels.set(DeuteriumSynthesizer, 17);
  planet2.buildingLevels.set(SolarPlant, 16);
  planet2.buildingLevels.set(FusionReactor, 0);
  planet2.ships.set(Crawler, 0);
  planet2.ships.set(SolarSatellite, 90);

  const planet3 = createPlanet({galaxy: 4, solarSystem: 84, position: 10}, 193 - 25, 12 - 20);
  planet3.buildingLevels.set(MetalMine, 21);
  planet3.buildingLevels.set(CrystalMine, 18);
  planet3.buildingLevels.set(DeuteriumSynthesizer, 15);
  planet3.buildingLevels.set(SolarPlant, 16);
  planet3.buildingLevels.set(FusionReactor, 0);
  planet3.ships.set(Crawler, 0);
  planet3.ships.set(SolarSatellite, 61);

  const planet4 = createPlanet({galaxy: 5, solarSystem: 323, position: 12}, 163, 1 - 20);
  planet4.buildingLevels.set(MetalMine, 23);
  planet4.buildingLevels.set(CrystalMine, 20);
  planet4.buildingLevels.set(DeuteriumSynthesizer, 18);
  planet4.buildingLevels.set(SolarPlant, 16);
  planet4.buildingLevels.set(FusionReactor, 0);
  planet4.ships.set(Crawler, 0);
  planet4.ships.set(SolarSatellite, 129);

  const planet5 = createPlanet({galaxy: 5, solarSystem: 323, position: 9}, 212 - 25, 34 - 20);
  planet5.buildingLevels.set(MetalMine, 22);
  planet5.buildingLevels.set(CrystalMine, 20);
  planet5.buildingLevels.set(DeuteriumSynthesizer, 19);
  planet5.buildingLevels.set(SolarPlant, 16);
  planet5.buildingLevels.set(FusionReactor, 0);
  planet5.ships.set(Crawler, 0);
  planet5.ships.set(SolarSatellite, 99);

  const planet6 = createPlanet({galaxy: 5, solarSystem: 331, position: 9}, 188 - 25, 56 - 20);
  planet6.buildingLevels.set(MetalMine, 22);
  planet6.buildingLevels.set(CrystalMine, 20);
  planet6.buildingLevels.set(DeuteriumSynthesizer, 18);
  planet6.buildingLevels.set(SolarPlant, 16);
  planet6.buildingLevels.set(FusionReactor, 0);
  planet6.ships.set(Crawler, 0);
  planet6.ships.set(SolarSatellite, 86);

  return {
    universe,
    planets: [planet1, planet2, planet3, planet4, planet5, planet6],
    technologyLevels: new Map<Technology, number>([
      [PlasmaTechnology, 7],
      [EnergyTechnology, 8],
    ]),
    officers: {
      commander: true,
      fleetAdmiral: true,
      engineer: true,
      geologist: true,
      technocrat: true,
    },
    class: Class.Collector,
    preferences: {
      resourcesRatio: {
        metal: 2,
        crystal: 1.5,
        deuterium: 1,
      },
    },
  };
}
