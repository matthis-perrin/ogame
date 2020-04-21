import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {getSatelliteEnergyProductionPerHour, getShipCargoCapacity} from '@shared/lib/formula';
import {
  CrystalMine,
  CrystalStorage,
  DeuteriumSynthesizer,
  DeuteriumTank,
  MetalMine,
  MetalStorage,
  MissileSilo,
  NaniteFactory,
  ResearchLab,
  RoboticsFactory,
  Shipyard,
  SolarPlant,
} from '@shared/models/building';
import {
  GaussCannon,
  HeavyLaser,
  LargeShieldDome,
  MissileInterceptor,
  PlasmaTurret,
  RocketLauncher,
  SmallShieldDome,
} from '@shared/models/defense';
import {
  ColonyShip,
  EspionageProbe,
  LargeCargo,
  Recycler,
  SmallCargo,
  SolarSatellite,
} from '@shared/models/ships';
import {HyperspaceTechnology} from '@shared/models/technology';

import {
  goToDefenses,
  goToFactories,
  goToMines,
  goToResources,
  goToShips,
} from '@src/controllers/navigator';
import {Account} from '@src/models/account';
import {
  COLLECTOR_BONUS_ENERGY,
  COLLECTOR_BONUS_FRET,
  DEBRIS_PERCENTAGE,
  DEBRIS_SAT,
  INACTIVITY_TIME,
  RATIO_ALO,
  RATIO_GAU,
  RATIO_LM,
  RATIO_PLA,
} from '@src/models/constants';
import {Table, Title} from '@src/ui/common';
import {Energy} from '@src/ui/components/energy';
import {Loot} from '@src/ui/components/loot';
import {Production} from '@src/ui/components/production';
import {Resource} from '@src/ui/components/resource';
import {TechnologyC} from '@src/ui/components/technology';
import {sum} from '@src/ui/utils';

interface EmpireProps {
  account: Account;
}

export const Empire: FC<EmpireProps> = ({account}) => (
  <Fragment>
    <Table>
      <thead>
        <tr>
          <th>
            <Title>Ressources</Title>
          </th>
          <th>
            <Title>Mines</Title>
          </th>
          <th>
            <Title>Énergie</Title>
          </th>
          <th>
            <Title>Hangars</Title>
          </th>
          <th>
            <Title>Usines</Title>
          </th>
          <th colSpan={2}>
            <Title>Défense</Title>
          </th>
          <th>
            <Title>Flotte</Title>
          </th>
          <th>
            <Title>Prod</Title>
          </th>
          <th>
            <Title>Loot</Title>
          </th>
        </tr>
      </thead>
      <tbody>
        {account.planetList.map(p => {
          if (account.planetDetails.hasOwnProperty(p.id)) {
            const planet = account.planetDetails[p.id];
            const inactivityProduction =
              sum([
                planet.productions.metal,
                planet.productions.crystal,
                planet.productions.deuterium,
              ]) *
              3600 *
              INACTIVITY_TIME;
            const inactivityLoot = inactivityProduction / 2;
            const satelliteLoot = planet.technologies.hasOwnProperty(SolarSatellite.id)
              ? planet.technologies[SolarSatellite.id].value * DEBRIS_SAT * DEBRIS_PERCENTAGE
              : 0;
            const totalLoot = inactivityLoot + satelliteLoot;
            const resourcesSum = sum([
              planet.resources.metal,
              planet.resources.crystal,
              planet.resources.deuterium,
            ]);
            const storagesSum = sum([
              planet.storages.metal,
              planet.storages.crystal,
              planet.storages.deuterium,
            ]);
            const productionsSum = sum([
              planet.productions.metal,
              planet.productions.crystal,
              planet.productions.deuterium,
            ]);
            const hyperLevel = account.accountTechnologies.hasOwnProperty(HyperspaceTechnology.id)
              ? account.accountTechnologies[HyperspaceTechnology.id].value
              : 0;
            const ptAmount = planet.ships.hasOwnProperty(SmallCargo.id)
              ? planet.ships[SmallCargo.id].value
              : 0;
            const fretPt = getShipCargoCapacity(SmallCargo, hyperLevel, COLLECTOR_BONUS_FRET);
            const fretGt = getShipCargoCapacity(LargeCargo, hyperLevel, COLLECTOR_BONUS_FRET);
            const requiredGt = Math.ceil((resourcesSum - ptAmount * fretPt) / fretGt);
            let requiredSat = 0;
            if (planet.resources.energy < 0) {
              const satEnergy = getSatelliteEnergyProductionPerHour(
                1,
                (p.tempHigh + p.tempLow) / 2,
                COLLECTOR_BONUS_ENERGY
              );
              const satNumber = planet.technologies.hasOwnProperty(SolarSatellite.id)
                ? planet.technologies[SolarSatellite.id].value
                : 0;
              requiredSat = (satNumber as number) + Math.ceil(-planet.resources.energy / satEnergy);
            }
            return (
              <tr key={p.id}>
                <td>
                  <Line>
                    <Resource
                      name="M"
                      amount={planet.resources.metal}
                      storage={planet.storages.metal}
                      production={planet.productions.metal}
                    />
                    <Resource
                      name="C"
                      amount={planet.resources.crystal}
                      storage={planet.storages.crystal}
                      production={planet.productions.crystal}
                    />
                    <Resource
                      name="D"
                      amount={planet.resources.deuterium}
                      storage={planet.storages.deuterium}
                      production={planet.productions.deuterium}
                    />
                    <Resource
                      name="Σ"
                      amount={resourcesSum}
                      storage={storagesSum}
                      production={productionsSum}
                    />
                  </Line>
                </td>
                <td onClick={() => goToMines(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC
                      name="M"
                      technologies={planet.technologies}
                      techId={MetalMine.id}
                      required={
                        account.maxTechnologies.hasOwnProperty(MetalMine.id)
                          ? account.maxTechnologies[MetalMine.id]
                          : undefined
                      }
                    />
                    <TechnologyC
                      name="C"
                      technologies={planet.technologies}
                      techId={CrystalMine.id}
                      required={
                        account.maxTechnologies.hasOwnProperty(CrystalMine.id)
                          ? account.maxTechnologies[CrystalMine.id]
                          : undefined
                      }
                    />
                    <TechnologyC
                      name="D"
                      technologies={planet.technologies}
                      techId={DeuteriumSynthesizer.id}
                      required={
                        account.maxTechnologies.hasOwnProperty(DeuteriumSynthesizer.id)
                          ? account.maxTechnologies[DeuteriumSynthesizer.id]
                          : undefined
                      }
                    />
                  </Line>
                </td>
                <td onClick={() => goToResources(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC
                      name="Sol"
                      technologies={planet.technologies}
                      techId={SolarPlant.id}
                      required={
                        account.maxTechnologies.hasOwnProperty(SolarPlant.id)
                          ? account.maxTechnologies[SolarPlant.id]
                          : undefined
                      }
                    />
                    <TechnologyC
                      name="Sat"
                      technologies={planet.technologies}
                      techId={SolarSatellite.id}
                      required={requiredSat}
                    />
                    <Energy name="E" amount={planet.resources.energy} />
                  </Line>
                </td>
                <td onClick={() => goToMines(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC
                      name="M"
                      technologies={planet.technologies}
                      techId={MetalStorage.id}
                      required={
                        account.maxTechnologies.hasOwnProperty(MetalStorage.id)
                          ? account.maxTechnologies[MetalStorage.id]
                          : undefined
                      }
                    />
                    <TechnologyC
                      name="C"
                      technologies={planet.technologies}
                      techId={CrystalStorage.id}
                      required={
                        account.maxTechnologies.hasOwnProperty(CrystalStorage.id)
                          ? account.maxTechnologies[CrystalStorage.id]
                          : undefined
                      }
                    />
                    <TechnologyC
                      name="D"
                      technologies={planet.technologies}
                      techId={DeuteriumTank.id}
                      required={
                        account.maxTechnologies.hasOwnProperty(DeuteriumTank.id)
                          ? account.maxTechnologies[DeuteriumTank.id]
                          : undefined
                      }
                    />
                    <TechnologyC
                      name="Silo"
                      technologies={planet.technologies}
                      techId={MissileSilo.id}
                      required={
                        account.maxTechnologies.hasOwnProperty(MissileSilo.id)
                          ? account.maxTechnologies[MissileSilo.id]
                          : undefined
                      }
                    />
                  </Line>
                </td>
                <td onClick={() => goToFactories(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC
                      name="Rob"
                      technologies={planet.technologies}
                      techId={RoboticsFactory.id}
                      required={
                        account.maxTechnologies.hasOwnProperty(RoboticsFactory.id)
                          ? account.maxTechnologies[RoboticsFactory.id]
                          : undefined
                      }
                    />
                    <TechnologyC
                      name="Spa"
                      technologies={planet.technologies}
                      techId={Shipyard.id}
                      required={
                        account.maxTechnologies.hasOwnProperty(Shipyard.id)
                          ? account.maxTechnologies[Shipyard.id]
                          : undefined
                      }
                    />
                    <TechnologyC
                      name="Lab"
                      technologies={planet.technologies}
                      techId={ResearchLab.id}
                    />
                    <TechnologyC
                      name="Nan"
                      technologies={planet.technologies}
                      techId={NaniteFactory.id}
                      required={
                        account.maxTechnologies.hasOwnProperty(NaniteFactory.id)
                          ? account.maxTechnologies[NaniteFactory.id]
                          : undefined
                      }
                    />
                  </Line>
                </td>
                <td onClick={() => goToDefenses(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC
                      name="LM"
                      technologies={planet.technologies}
                      techId={RocketLauncher.id}
                      required={Math.ceil(RATIO_LM * totalLoot)}
                    />
                    <TechnologyC
                      name="ALO"
                      technologies={planet.technologies}
                      techId={HeavyLaser.id}
                      required={Math.ceil(RATIO_ALO * totalLoot)}
                    />
                    <TechnologyC
                      name="GAU"
                      technologies={planet.technologies}
                      techId={GaussCannon.id}
                      required={Math.ceil(RATIO_GAU * totalLoot)}
                    />{' '}
                    <TechnologyC
                      name="PLA"
                      technologies={planet.technologies}
                      techId={PlasmaTurret.id}
                      required={Math.ceil(RATIO_PLA * totalLoot)}
                    />
                  </Line>
                </td>
                <td onClick={() => goToShips(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC
                      name="PB"
                      technologies={planet.technologies}
                      techId={SmallShieldDome.id}
                      required={1}
                    />
                    <TechnologyC
                      name="GB"
                      technologies={planet.technologies}
                      techId={LargeShieldDome.id}
                      required={1}
                    />
                    <TechnologyC
                      name="MIS"
                      technologies={planet.technologies}
                      techId={MissileInterceptor.id}
                      required={
                        planet.technologies.hasOwnProperty(MissileSilo.id) &&
                        planet.technologies[MissileSilo.id].value >= 2
                          ? planet.technologies[MissileSilo.id].value * 10
                          : 0
                      }
                    />
                  </Line>
                </td>
                <td onClick={() => goToShips(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC name="PT" technologies={planet.ships} techId={SmallCargo.id} />
                    <TechnologyC
                      name="GT"
                      technologies={planet.ships}
                      techId={LargeCargo.id}
                      required={requiredGt}
                    />
                    <TechnologyC name="REC" technologies={planet.ships} techId={Recycler.id} />
                    <TechnologyC name="COLO" technologies={planet.ships} techId={ColonyShip.id} />
                    <TechnologyC
                      name="ESP"
                      technologies={planet.ships}
                      techId={EspionageProbe.id}
                    />
                  </Line>
                </td>
                <td onClick={() => goToResources(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <Production name="M" production={planet.productions.metal} unit="h" />
                    <Production name="C" production={planet.productions.crystal} unit="h" />
                    <Production name="D" production={planet.productions.deuterium} unit="h" />
                    <Production name="Σ" production={productionsSum} unit="h" />
                  </Line>
                </td>
                <td>
                  <Line>
                    <Loot name="Prod" amount={inactivityLoot} />
                    <Loot name="Sats" amount={satelliteLoot} />
                    <Loot name="Total" amount={totalLoot} />
                  </Line>
                </td>
              </tr>
            );
          }
          return (
            <tr key={p.id}>
              <td colSpan={10}>
                <Line></Line>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  </Fragment>
);

const Line = styled.div`
  height: 70px;
`;
