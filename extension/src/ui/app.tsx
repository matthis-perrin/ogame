import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {
  ALO_RATIO,
  CRYSTAL_REQ,
  DEBRIS_PERCENTAGE,
  DEUTERIUM_REQ,
  GAU_RATIO,
  GT_FRET,
  INACTIVITY_TIME,
  LM_RATIO,
  METAL_REQ,
  PLA_RATIO,
  ROBOTS_REQ,
  SAT_DEBRIS,
  SILO_REQ,
  SPA_REQ,
  SUM_PLANET,
} from '@src/models/constants';
import {Tech} from '@src/models/tech';
import {useAccount} from '@src/stores/account';
import {Energy} from '@src/ui/energy';
import {Loot} from '@src/ui/loot';
import {Production} from '@src/ui/production';
import {Resource} from '@src/ui/resource';
import {TechnologyC} from '@src/ui/technology';
import {sum} from '@src/ui/utils';

export const App: FC = () => {
  const [account] = useAccount();
  return (
    <Fragment>
      <Container>
        {account === undefined ? (
          ''
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Ressources</th>
                <th>Prod</th>
                <th>Mines</th>
                <th>Énergie</th>
                <th>Hangars</th>
                <th>Usines</th>
                <th colSpan={2}>Défense</th>
                <th>Flotte</th>
                <th>Loot</th>
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
                  const satelliteLoot = planet.technologies.hasOwnProperty(Tech.SolarSatellite)
                    ? planet.technologies[Tech.SolarSatellite].value *
                      SAT_DEBRIS *
                      DEBRIS_PERCENTAGE
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
                  const requiredTransport = Math.ceil(resourcesSum / GT_FRET);
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
                      <td>
                        <Line>
                          <Production name="M" production={planet.productions.metal} />
                          <Production name="C" production={planet.productions.crystal} />
                          <Production name="D" production={planet.productions.deuterium} />
                          <Production name="Σ" production={productionsSum} />
                        </Line>
                      </td>
                      <td>
                        {p.id === SUM_PLANET ? (
                          ''
                        ) : (
                          <Line>
                            <TechnologyC
                              name="M"
                              technologies={planet.technologies}
                              techId={Tech.MetalMine}
                              required={METAL_REQ}
                            />
                            <TechnologyC
                              name="C"
                              technologies={planet.technologies}
                              techId={Tech.CrystalMine}
                              required={CRYSTAL_REQ}
                            />
                            <TechnologyC
                              name="D"
                              technologies={planet.technologies}
                              techId={Tech.DeuteriumSynthesizer}
                              required={DEUTERIUM_REQ}
                            />
                          </Line>
                        )}
                      </td>
                      <td>
                        {p.id === SUM_PLANET ? (
                          ''
                        ) : (
                          <Line>
                            <TechnologyC
                              name="Sol"
                              technologies={planet.technologies}
                              techId={Tech.SolarPlant}
                            />
                            <TechnologyC
                              name="Sat"
                              technologies={planet.technologies}
                              techId={Tech.SolarSatellite}
                            />
                            <Energy name="E" amount={planet.resources.energy} />
                          </Line>
                        )}
                      </td>
                      <td>
                        {p.id === SUM_PLANET ? (
                          ''
                        ) : (
                          <Line>
                            <TechnologyC
                              name="M"
                              technologies={planet.technologies}
                              techId={Tech.MetalStorage}
                            />
                            <TechnologyC
                              name="C"
                              technologies={planet.technologies}
                              techId={Tech.CrystalStorage}
                            />
                            <TechnologyC
                              name="D"
                              technologies={planet.technologies}
                              techId={Tech.DeuteriumStorage}
                            />
                            <TechnologyC
                              name="Silo"
                              technologies={planet.technologies}
                              techId={Tech.MissileSilo}
                              required={SILO_REQ}
                            />
                          </Line>
                        )}
                      </td>
                      <td>
                        {p.id === SUM_PLANET ? (
                          ''
                        ) : (
                          <Line>
                            <TechnologyC
                              name="Rob"
                              technologies={planet.technologies}
                              techId={Tech.RoboticsFactory}
                              required={ROBOTS_REQ}
                            />
                            <TechnologyC
                              name="Spa"
                              technologies={planet.technologies}
                              techId={Tech.Shipyard}
                              required={SPA_REQ}
                            />
                            <TechnologyC
                              name="Lab"
                              technologies={planet.technologies}
                              techId={Tech.ResearchLaboratory}
                            />
                            <TechnologyC
                              name="Nan"
                              technologies={planet.technologies}
                              techId={Tech.NaniteFactory}
                            />
                          </Line>
                        )}
                      </td>
                      <td>
                        {p.id === SUM_PLANET ? (
                          ''
                        ) : (
                          <Line>
                            <TechnologyC
                              name="LM"
                              technologies={planet.technologies}
                              techId={Tech.RocketLauncher}
                              required={Math.ceil(LM_RATIO * totalLoot)}
                            />
                            <TechnologyC
                              name="ALO"
                              technologies={planet.technologies}
                              techId={Tech.LaserCannonHeavy}
                              required={Math.ceil(ALO_RATIO * totalLoot)}
                            />
                            <TechnologyC
                              name="GAU"
                              technologies={planet.technologies}
                              techId={Tech.GaussCannon}
                              required={Math.ceil(GAU_RATIO * totalLoot)}
                            />{' '}
                            <TechnologyC
                              name="PLA"
                              technologies={planet.technologies}
                              techId={Tech.PlasmaCannon}
                              required={Math.ceil(PLA_RATIO * totalLoot)}
                            />
                          </Line>
                        )}
                      </td>
                      <td>
                        {p.id === SUM_PLANET ? (
                          ''
                        ) : (
                          <Line>
                            <TechnologyC
                              name="PB"
                              technologies={planet.technologies}
                              techId={Tech.ShieldDomeSmall}
                              required={1}
                            />
                            <TechnologyC
                              name="GB"
                              technologies={planet.technologies}
                              techId={Tech.ShieldDomeLarge}
                              required={1}
                            />
                            <TechnologyC
                              name="MIS"
                              technologies={planet.technologies}
                              techId={Tech.MissileInterceptor}
                              required={
                                planet.technologies.hasOwnProperty(Tech.MissileSilo) &&
                                planet.technologies[Tech.MissileSilo].value >= 2
                                  ? planet.technologies[Tech.MissileSilo].value * 10
                                  : 0
                              }
                            />
                          </Line>
                        )}
                      </td>
                      <td>
                        {p.id === SUM_PLANET ? (
                          ''
                        ) : (
                          <Line>
                            <TechnologyC
                              name="PT"
                              technologies={planet.technologies}
                              techId={Tech.TransporterSmall}
                            />
                            <TechnologyC
                              name="GT"
                              technologies={planet.technologies}
                              techId={Tech.TransporterLarge}
                              required={requiredTransport}
                            />
                            <TechnologyC
                              name="REC"
                              technologies={planet.technologies}
                              techId={Tech.Recycler}
                            />
                            <TechnologyC
                              name="ESP"
                              technologies={planet.technologies}
                              techId={Tech.EspionageProbe}
                            />
                          </Line>
                        )}
                      </td>
                      <td>
                        {p.id === SUM_PLANET ? (
                          ''
                        ) : (
                          <Line>
                            <Loot name="Prod" amount={inactivityLoot} />
                            <Loot name="Sats" amount={satelliteLoot} />
                            <Loot name="Total" amount={totalLoot} />
                          </Line>
                        )}
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
        )}
      </Container>
    </Fragment>
  );
};

const Container = styled.div`
  margin-top: 125px;
`;

const Table = styled.table`
  border-collapse: collapse;
  text-align: left;
  color: #aaa;
  th,
  td {
    padding: 0 4px;
  }
  th {
    font-weight: bold;
    padding-bottom: 5px;
  }
`;

const Line = styled.div`
  height: 60px;
  overflow: hidden;
  font-size: 10px;
`;
