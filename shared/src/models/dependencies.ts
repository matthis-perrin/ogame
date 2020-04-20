/* eslint-disable @typescript-eslint/no-magic-numbers */
// Setup all the `requirements` and `rapidfire` at runtime to prevent circular dependencies
import {
  DeuteriumSynthesizer,
  FusionReactor,
  MissileSilo,
  NaniteFactory,
  ResearchLab,
  RoboticsFactory,
  Shipyard,
} from '@shared/models/building';
import {
  GaussCannon,
  HeavyLaser,
  IonCannon,
  LargeShieldDome,
  LightLaser,
  MissileInterceptor,
  MissileInterplanetary,
  PlasmaTurret,
  RocketLauncher,
  SmallShieldDome,
} from '@shared/models/defense';
import {
  BattleCruiser,
  Battleship,
  Bomber,
  ColonyShip,
  Crawler,
  Cruiser,
  Destroyer,
  EspionageProbe,
  HeavyFighter,
  LargeCargo,
  LightFighter,
  Pathfinder,
  Reaper,
  Recycler,
  SmallCargo,
  SolarSatellite,
} from '@shared/models/ships';
import {
  ArmourTechnology,
  AstrophysicsTechnology,
  CombustionDrive,
  ComputerTechnology,
  EnergyTechnology,
  EspionageTechnology,
  GravitonTechnology,
  HyperspaceDrive,
  HyperspaceTechnology,
  ImpulseDrive,
  IntergalacticResearchNetworkTechnology,
  IonTechnology,
  LaserTechnology,
  PlasmaTechnology,
  ShieldingTechnology,
  WeaponTechnology,
} from '@shared/models/technology';

export function setupRequirements(): void {
  // Buildings
  FusionReactor.requirements.push(
    {entity: DeuteriumSynthesizer, level: 5},
    {entity: EnergyTechnology, level: 3}
  );
  Shipyard.requirements.push({entity: RoboticsFactory, level: 2});
  NaniteFactory.requirements.push(
    {entity: RoboticsFactory, level: 10},
    {entity: ComputerTechnology, level: 10}
  );
  ResearchLab.requirements.push({entity: DeuteriumSynthesizer, level: 1});
  RoboticsFactory.requirements.push({entity: DeuteriumSynthesizer, level: 1});
  MissileSilo.requirements.push({entity: Shipyard, level: 1});

  // Technologies
  ComputerTechnology.requirements.push({entity: ResearchLab, level: 1});
  EnergyTechnology.requirements.push({entity: ResearchLab, level: 1});
  EspionageTechnology.requirements.push({entity: ResearchLab, level: 3});
  WeaponTechnology.requirements.push({entity: ResearchLab, level: 4});
  ShieldingTechnology.requirements.push(
    {entity: ResearchLab, level: 6},
    {entity: EnergyTechnology, level: 3}
  );
  ArmourTechnology.requirements.push({entity: ResearchLab, level: 2});
  HyperspaceTechnology.requirements.push(
    {entity: ResearchLab, level: 7},
    {entity: ShieldingTechnology, level: 5},
    {entity: EnergyTechnology, level: 5}
  );
  CombustionDrive.requirements.push(
    {entity: ResearchLab, level: 1},
    {entity: EnergyTechnology, level: 1}
  );
  ImpulseDrive.requirements.push(
    {entity: ResearchLab, level: 2},
    {entity: EnergyTechnology, level: 1}
  );
  HyperspaceDrive.requirements.push(
    {entity: ResearchLab, level: 7},
    {entity: EnergyTechnology, level: 5},
    {entity: ShieldingTechnology, level: 5},
    {entity: HyperspaceTechnology, level: 3}
  );
  LaserTechnology.requirements.push(
    {entity: ResearchLab, level: 1},
    {entity: EnergyTechnology, level: 2}
  );
  IonTechnology.requirements.push(
    {entity: ResearchLab, level: 4},
    {entity: EnergyTechnology, level: 5}
  );
  PlasmaTechnology.requirements.push(
    {entity: ResearchLab, level: 4},
    {entity: EnergyTechnology, level: 8},
    {entity: LaserTechnology, level: 10},
    {entity: IonTechnology, level: 5}
  );
  IntergalacticResearchNetworkTechnology.requirements.push(
    {entity: ResearchLab, level: 10},
    {entity: ComputerTechnology, level: 8},
    {entity: HyperspaceTechnology, level: 8}
  );
  AstrophysicsTechnology.requirements.push(
    {entity: ResearchLab, level: 3},
    {entity: EspionageTechnology, level: 4},
    {entity: ImpulseDrive, level: 3}
  );
  GravitonTechnology.requirements.push({entity: ResearchLab, level: 12});

  // Defenses
  RocketLauncher.requirements.push({entity: Shipyard, level: 1});
  LightLaser.requirements.push(
    {entity: EnergyTechnology, level: 1},
    {entity: Shipyard, level: 2},
    {entity: LaserTechnology, level: 3}
  );
  HeavyLaser.requirements.push(
    {entity: EnergyTechnology, level: 3},
    {entity: Shipyard, level: 4},
    {entity: LaserTechnology, level: 6}
  );
  IonCannon.requirements.push({entity: Shipyard, level: 4}, {entity: IonTechnology, level: 4});
  SmallShieldDome.requirements.push(
    {entity: Shipyard, level: 1},
    {entity: ShieldingTechnology, level: 2}
  );
  LargeShieldDome.requirements.push(
    {entity: Shipyard, level: 6},
    {entity: ShieldingTechnology, level: 6}
  );
  GaussCannon.requirements.push(
    {entity: Shipyard, level: 6},
    {entity: EnergyTechnology, level: 6},
    {entity: WeaponTechnology, level: 3},
    {entity: ShieldingTechnology, level: 1}
  );
  PlasmaTurret.requirements.push(
    {entity: Shipyard, level: 8},
    {entity: PlasmaTechnology, level: 7}
  );
  MissileInterceptor.requirements.push({entity: MissileSilo, level: 2});
  MissileInterplanetary.requirements.push(
    {entity: MissileSilo, level: 4},
    {entity: ImpulseDrive, level: 1}
  );

  // Ships
  EspionageProbe.requirements.push(
    {entity: Shipyard, level: 3},
    {entity: CombustionDrive, level: 3},
    {entity: EspionageTechnology, level: 2}
  );
  SolarSatellite.requirements.push({entity: Shipyard, level: 1});
  Crawler.requirements.push(
    {entity: Shipyard, level: 5},
    {entity: CombustionDrive, level: 4},
    {entity: ArmourTechnology, level: 4},
    {entity: LaserTechnology, level: 4}
  );
  SmallCargo.requirements.push({entity: Shipyard, level: 2}, {entity: CombustionDrive, level: 2});
  LargeCargo.requirements.push({entity: Shipyard, level: 4}, {entity: CombustionDrive, level: 6});
  Recycler.requirements.push(
    {entity: Shipyard, level: 4},
    {entity: CombustionDrive, level: 6},
    {entity: ShieldingTechnology, level: 2}
  );
  ColonyShip.requirements.push({entity: ImpulseDrive, level: 3}, {entity: Shipyard, level: 4});
  LightFighter.requirements.push({entity: Shipyard, level: 1}, {entity: CombustionDrive, level: 1});
  Cruiser.requirements.push(
    {entity: Shipyard, level: 5},
    {entity: ImpulseDrive, level: 4},
    {entity: IonTechnology, level: 2}
  );
  HeavyFighter.requirements.push(
    {entity: Shipyard, level: 3},
    {entity: ArmourTechnology, level: 2},
    {entity: ImpulseDrive, level: 2}
  );
  Pathfinder.requirements.push(
    {entity: Shipyard, level: 5},
    {entity: HyperspaceDrive, level: 2},
    {entity: ShieldingTechnology, level: 4}
    // TODO - Requires the "classe explorateur
  );
  Battleship.requirements.push({entity: HyperspaceDrive, level: 4}, {entity: Shipyard, level: 7});
  BattleCruiser.requirements.push(
    {entity: HyperspaceTechnology, level: 5},
    {entity: HyperspaceDrive, level: 5},
    {entity: Shipyard, level: 8},
    {entity: LaserTechnology, level: 12}
  );
  Destroyer.requirements.push(
    {entity: Shipyard, level: 9},
    {entity: HyperspaceDrive, level: 6},
    {entity: HyperspaceTechnology, level: 5}
  );
  Bomber.requirements.push(
    {entity: PlasmaTechnology, level: 5},
    {entity: ImpulseDrive, level: 6},
    {entity: Shipyard, level: 8}
  );
  Reaper.requirements.push(
    {entity: Shipyard, level: 10},
    {entity: HyperspaceTechnology, level: 6},
    {entity: HyperspaceDrive, level: 7},
    {entity: ShieldingTechnology, level: 6}
  );
}

export function setupRapidFire(): void {
  SmallCargo.rapidFire.set(EspionageProbe, 5);
  SmallCargo.rapidFire.set(SolarSatellite, 5);
  SmallCargo.rapidFire.set(Crawler, 5);

  LargeCargo.rapidFire.set(EspionageProbe, 5);
  LargeCargo.rapidFire.set(SolarSatellite, 5);
  LargeCargo.rapidFire.set(Crawler, 5);

  // TODO - Can recycle 100% of debris fields

  Recycler.rapidFire.set(EspionageProbe, 5);
  Recycler.rapidFire.set(SolarSatellite, 5);
  Recycler.rapidFire.set(Crawler, 5);

  ColonyShip.rapidFire.set(EspionageProbe, 5);
  ColonyShip.rapidFire.set(SolarSatellite, 5);
  ColonyShip.rapidFire.set(Crawler, 5);

  LightFighter.rapidFire.set(EspionageProbe, 5);
  LightFighter.rapidFire.set(SolarSatellite, 5);
  LightFighter.rapidFire.set(Crawler, 5);

  Cruiser.rapidFire.set(EspionageProbe, 5);
  Cruiser.rapidFire.set(SolarSatellite, 5);
  Cruiser.rapidFire.set(LightFighter, 6);
  Cruiser.rapidFire.set(Crawler, 5);
  Cruiser.rapidFire.set(RocketLauncher, 10);

  HeavyFighter.rapidFire.set(SmallCargo, 3);
  HeavyFighter.rapidFire.set(EspionageProbe, 5);
  HeavyFighter.rapidFire.set(SolarSatellite, 5);
  HeavyFighter.rapidFire.set(Crawler, 5);

  Pathfinder.rapidFire.set(EspionageProbe, 5);
  Pathfinder.rapidFire.set(SolarSatellite, 5);
  Pathfinder.rapidFire.set(Crawler, 5);
  Pathfinder.rapidFire.set(Cruiser, 3);
  Pathfinder.rapidFire.set(LightFighter, 3);
  Pathfinder.rapidFire.set(HeavyFighter, 2);

  Battleship.rapidFire.set(EspionageProbe, 5);
  Battleship.rapidFire.set(SolarSatellite, 5);
  Battleship.rapidFire.set(Crawler, 5);
  Battleship.rapidFire.set(Pathfinder, 5);

  BattleCruiser.rapidFire.set(EspionageProbe, 5);
  BattleCruiser.rapidFire.set(SolarSatellite, 5);
  BattleCruiser.rapidFire.set(SmallCargo, 3);
  BattleCruiser.rapidFire.set(LargeCargo, 3);
  BattleCruiser.rapidFire.set(HeavyFighter, 4);
  BattleCruiser.rapidFire.set(Cruiser, 4);
  BattleCruiser.rapidFire.set(Battleship, 7);
  BattleCruiser.rapidFire.set(Crawler, 5);

  Destroyer.rapidFire.set(EspionageProbe, 5);
  Destroyer.rapidFire.set(SolarSatellite, 5);
  Destroyer.rapidFire.set(BattleCruiser, 2);
  Destroyer.rapidFire.set(Crawler, 5);
  Destroyer.rapidFire.set(LightLaser, 10);

  Bomber.rapidFire.set(EspionageProbe, 5);
  Bomber.rapidFire.set(SolarSatellite, 5);
  Bomber.rapidFire.set(Crawler, 5);
  Bomber.rapidFire.set(RocketLauncher, 20);
  Bomber.rapidFire.set(LightLaser, 20);
  Bomber.rapidFire.set(HeavyLaser, 10);
  Bomber.rapidFire.set(IonCannon, 10);
  Bomber.rapidFire.set(GaussCannon, 5);
  Bomber.rapidFire.set(PlasmaTurret, 5);

  Reaper.rapidFire.set(EspionageProbe, 5);
  Reaper.rapidFire.set(SolarSatellite, 5);
  Reaper.rapidFire.set(Crawler, 5);
  Reaper.rapidFire.set(Battleship, 7);
  Reaper.rapidFire.set(Bomber, 4);
  Reaper.rapidFire.set(Destroyer, 3);
}
