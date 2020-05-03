import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {getSatelliteEnergyProductionPerHour} from '@shared/lib/formula';
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
  Bomber,
  ColonyShip,
  EspionageProbe,
  LargeCargo,
  Recycler,
  SolarSatellite,
} from '@shared/models/ships';
import {Crystal, Deuterium, Metal} from '@shared/models/stock';

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
  COLOR_GREEN,
  DEBRIS_PERCENTAGE,
  DEBRIS_SAT,
  INACTIVITY_TIME,
  RATIO_ALO,
  RATIO_GAU,
  RATIO_LM,
  RATIO_PLA,
} from '@src/models/constants';
import {ResourceAmount} from '@src/models/resources';
import {getFretCapacity} from '@src/models/technologies';
import {addObjectives} from '@src/stores/account/objectives';
import {Stock, Table, Title} from '@src/ui/common';
import {Energy} from '@src/ui/components/energy';
import {GhostC} from '@src/ui/components/ghost';
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
            <Title>Vol</Title>
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
          <th colSpan={2}>
            <Title>Flotte</Title>
          </th>
          <th>
            <Title>Prod</Title>
          </th>
          <th>
            <Title>Loot</Title>
          </th>
          <th>
            <Title>Ghost</Title>
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
            const inFlight = account.inFlightResources.hasOwnProperty(p.coords)
              ? account.inFlightResources[p.coords]
              : {
                  metal: 0 as ResourceAmount,
                  crystal: 0 as ResourceAmount,
                  deuterium: 0 as ResourceAmount,
                  sum: 0 as ResourceAmount,
                  largeCargos: 0,
                };
            const fretLargeCargo = getFretCapacity(account.accountTechnologies, LargeCargo);
            const requiredLargeCargos = Math.ceil(
              sum([planet.resources.sum, inFlight.sum]) / fretLargeCargo
            );
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
              requiredSat = satNumber + Math.ceil(-planet.resources.energy / satEnergy);
            }
            return (
              <PlanetLine key={p.id} className={p.id === account.currentPlanetId ? 'active' : ''}>
                <td>
                  <Line>
                    <Stock
                      onClick={() => {
                        addObjectives(p.id, {
                          techId: Metal.id,
                          value: 0,
                          target: 1000000,
                        });
                      }}
                    >
                      <Resource
                        name="M"
                        amount={planet.resources.metal}
                        storage={planet.storages.metal}
                        production={planet.productions.metal}
                      />
                    </Stock>
                    <Stock
                      onClick={() => {
                        addObjectives(p.id, {
                          techId: Crystal.id,
                          value: 0,
                          target: 1000000,
                        });
                      }}
                    >
                      <Resource
                        name="C"
                        amount={planet.resources.crystal}
                        storage={planet.storages.crystal}
                        production={planet.productions.crystal}
                      />
                    </Stock>
                    <Stock
                      onClick={() => {
                        addObjectives(p.id, {
                          techId: Deuterium.id,
                          value: 0,
                          target: 1000000,
                        });
                      }}
                    >
                      <Resource
                        name="D"
                        amount={planet.resources.deuterium}
                        storage={planet.storages.deuterium}
                        production={planet.productions.deuterium}
                      />
                    </Stock>
                    <Resource
                      name="Σ"
                      amount={planet.resources.sum}
                      storage={planet.storages.sum}
                      production={planet.productions.sum}
                    />
                  </Line>
                </td>
                <td>
                  <Line>
                    <Resource name="M" amount={inFlight.metal} />
                    <Resource name="C" amount={inFlight.crystal} />
                    <Resource name="D" amount={inFlight.deuterium} />
                    <Resource name="Σ" amount={inFlight.sum} />
                  </Line>
                </td>
                <td onClick={() => goToMines(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC
                      name="M"
                      technologies={planet.technologies}
                      techId={MetalMine.id}
                      planetId={planet.planetId}
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
                      planetId={planet.planetId}
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
                      planetId={planet.planetId}
                      required={
                        account.maxTechnologies.hasOwnProperty(DeuteriumSynthesizer.id)
                          ? account.maxTechnologies[DeuteriumSynthesizer.id]
                          : undefined
                      }
                    />
                  </Line>
                </td>
                <td onClick={() => goToMines(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC
                      name="Sol"
                      technologies={planet.technologies}
                      techId={SolarPlant.id}
                      planetId={planet.planetId}
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
                      planetId={planet.planetId}
                      required={requiredSat}
                    />
                    <Energy name="E" amount={planet.resources.energy} />
                    <div>
                      {p.usedSpace}/{p.totalSpace}
                    </div>
                  </Line>
                </td>
                <td onClick={() => goToMines(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC
                      name="M"
                      technologies={planet.technologies}
                      techId={MetalStorage.id}
                      planetId={planet.planetId}
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
                      planetId={planet.planetId}
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
                      planetId={planet.planetId}
                      required={
                        account.maxTechnologies.hasOwnProperty(DeuteriumTank.id)
                          ? account.maxTechnologies[DeuteriumTank.id]
                          : undefined
                      }
                    />
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        goToFactories(planet.planetId);
                      }}
                      style={{cursor: 'pointer'}}
                    >
                      <TechnologyC
                        name="Silo"
                        technologies={planet.technologies}
                        techId={MissileSilo.id}
                        planetId={planet.planetId}
                        required={
                          account.maxTechnologies.hasOwnProperty(MissileSilo.id)
                            ? account.maxTechnologies[MissileSilo.id]
                            : undefined
                        }
                      />
                    </div>
                  </Line>
                </td>
                <td onClick={() => goToFactories(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC
                      name="Rob"
                      technologies={planet.technologies}
                      techId={RoboticsFactory.id}
                      planetId={planet.planetId}
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
                      planetId={planet.planetId}
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
                      planetId={planet.planetId}
                    />
                    <TechnologyC
                      name="Nan"
                      technologies={planet.technologies}
                      techId={NaniteFactory.id}
                      planetId={planet.planetId}
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
                      planetId={planet.planetId}
                      required={Math.ceil(RATIO_LM * totalLoot)}
                    />
                    <TechnologyC
                      name="ALO"
                      technologies={planet.technologies}
                      techId={HeavyLaser.id}
                      planetId={planet.planetId}
                      required={Math.ceil(RATIO_ALO * totalLoot)}
                    />
                    <TechnologyC
                      name="GAU"
                      technologies={planet.technologies}
                      techId={GaussCannon.id}
                      planetId={planet.planetId}
                      required={Math.ceil(RATIO_GAU * totalLoot)}
                    />{' '}
                    <TechnologyC
                      name="PLA"
                      technologies={planet.technologies}
                      techId={PlasmaTurret.id}
                      planetId={planet.planetId}
                      required={Math.ceil(RATIO_PLA * totalLoot)}
                    />
                  </Line>
                </td>
                <td onClick={() => goToDefenses(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <TechnologyC
                      name="PB"
                      technologies={planet.technologies}
                      techId={SmallShieldDome.id}
                      planetId={planet.planetId}
                      required={1}
                    />
                    <TechnologyC
                      name="GB"
                      technologies={planet.technologies}
                      techId={LargeShieldDome.id}
                      planetId={planet.planetId}
                      required={1}
                    />
                    <TechnologyC
                      name="MIS"
                      technologies={planet.technologies}
                      techId={MissileInterceptor.id}
                      planetId={planet.planetId}
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
                    <TechnologyC
                      name="GT"
                      technologies={planet.ships}
                      techId={LargeCargo.id}
                      planetId={planet.planetId}
                      required={requiredLargeCargos}
                      additional={inFlight.largeCargos}
                    />
                    <TechnologyC
                      name="ESP"
                      technologies={planet.ships}
                      techId={EspionageProbe.id}
                      planetId={planet.planetId}
                    />
                    <TechnologyC
                      name="REC"
                      technologies={planet.ships}
                      techId={Recycler.id}
                      planetId={planet.planetId}
                    />
                    <TechnologyC
                      name="BOM"
                      technologies={planet.ships}
                      techId={Bomber.id}
                      planetId={planet.planetId}
                    />
                    <TechnologyC
                      name="COL"
                      technologies={planet.ships}
                      techId={ColonyShip.id}
                      planetId={planet.planetId}
                    />
                  </Line>
                </td>
                <td onClick={() => goToResources(planet.planetId)} style={{cursor: 'pointer'}}>
                  <Line>
                    <Production name="M" production={planet.productions.metal} unit="h" />
                    <Production name="C" production={planet.productions.crystal} unit="h" />
                    <Production name="D" production={planet.productions.deuterium} unit="h" />
                    <Production name="Σ" production={planet.productions.sum} unit="h" />
                  </Line>
                </td>
                <td>
                  <Line>
                    <Loot name="Prod" amount={inactivityLoot} />
                    <Loot name="Sats" amount={satelliteLoot} />
                    <Loot name="Total" amount={totalLoot} />
                  </Line>
                </td>
                <td>
                  <Line>
                    <GhostC ghosts={account.ghosts} planetId={planet.planetId} account={account} />
                  </Line>
                </td>
              </PlanetLine>
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

const PlanetLine = styled.tr`
  &.active {
    border: 1px solid ${COLOR_GREEN};
  }
`;

const Line = styled.div`
  height: 70px;
`;
