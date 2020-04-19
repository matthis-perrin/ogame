import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {AstrophysicsTechnology} from '@shared/models/technology';

import {
  ALO_RATIO,
  DEBRIS_PERCENTAGE,
  GAU_RATIO,
  GT_FRET,
  INACTIVITY_TIME,
  LM_RATIO,
  PLA_RATIO,
  SAT_DEBRIS,
  SUM_PLANET,
} from '@src/models/constants';
import {Tech} from '@src/models/tech';
import {useAccount} from '@src/stores/account';
import {Astrophysics} from '@src/ui/atrophysics';
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
          <div>
            <Table>
              <thead>
                <tr>
                  <th>
                    <Title>Ressources</Title>
                  </th>
                  <th>
                    <Title>Prod</Title>
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
                                required={
                                  account.maxTechnologies.hasOwnProperty(Tech.MetalMine)
                                    ? account.maxTechnologies[Tech.MetalMine]
                                    : undefined
                                }
                              />
                              <TechnologyC
                                name="C"
                                technologies={planet.technologies}
                                techId={Tech.CrystalMine}
                                required={
                                  account.maxTechnologies.hasOwnProperty(Tech.CrystalMine)
                                    ? account.maxTechnologies[Tech.CrystalMine]
                                    : undefined
                                }
                              />
                              <TechnologyC
                                name="D"
                                technologies={planet.technologies}
                                techId={Tech.DeuteriumSynthesizer}
                                required={
                                  account.maxTechnologies.hasOwnProperty(Tech.DeuteriumSynthesizer)
                                    ? account.maxTechnologies[Tech.DeuteriumSynthesizer]
                                    : undefined
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
                                name="Sol"
                                technologies={planet.technologies}
                                techId={Tech.SolarPlant}
                                required={
                                  account.maxTechnologies.hasOwnProperty(Tech.SolarPlant)
                                    ? account.maxTechnologies[Tech.SolarPlant]
                                    : undefined
                                }
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
                                required={
                                  account.maxTechnologies.hasOwnProperty(Tech.MetalStorage)
                                    ? account.maxTechnologies[Tech.MetalStorage]
                                    : undefined
                                }
                              />
                              <TechnologyC
                                name="C"
                                technologies={planet.technologies}
                                techId={Tech.CrystalStorage}
                                required={
                                  account.maxTechnologies.hasOwnProperty(Tech.CrystalStorage)
                                    ? account.maxTechnologies[Tech.CrystalStorage]
                                    : undefined
                                }
                              />
                              <TechnologyC
                                name="D"
                                technologies={planet.technologies}
                                techId={Tech.DeuteriumStorage}
                                required={
                                  account.maxTechnologies.hasOwnProperty(Tech.DeuteriumStorage)
                                    ? account.maxTechnologies[Tech.DeuteriumStorage]
                                    : undefined
                                }
                              />
                              <TechnologyC
                                name="Silo"
                                technologies={planet.technologies}
                                techId={Tech.MissileSilo}
                                required={
                                  account.maxTechnologies.hasOwnProperty(Tech.MissileSilo)
                                    ? account.maxTechnologies[Tech.MissileSilo]
                                    : undefined
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
                                name="Rob"
                                technologies={planet.technologies}
                                techId={Tech.RoboticsFactory}
                                required={
                                  account.maxTechnologies.hasOwnProperty(Tech.RoboticsFactory)
                                    ? account.maxTechnologies[Tech.RoboticsFactory]
                                    : undefined
                                }
                              />
                              <TechnologyC
                                name="Spa"
                                technologies={planet.technologies}
                                techId={Tech.Shipyard}
                                required={
                                  account.maxTechnologies.hasOwnProperty(Tech.Shipyard)
                                    ? account.maxTechnologies[Tech.Shipyard]
                                    : undefined
                                }
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
                                required={
                                  account.maxTechnologies.hasOwnProperty(Tech.NaniteFactory)
                                    ? account.maxTechnologies[Tech.NaniteFactory]
                                    : undefined
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
            {(() => {
              const astroLevel = account.accountTechnologies.hasOwnProperty(
                Tech.AstrophysicsTechnology
              )
                ? (account.accountTechnologies[Tech.AstrophysicsTechnology].value as number) + 1
                : 1;
              const astroCost = AstrophysicsTechnology.cost(astroLevel);
              let metalSeconds = 0;
              let crystalSeconds = 0;
              let deuteriumSeconds = 0;
              if (account.planetDetails.hasOwnProperty(SUM_PLANET)) {
                metalSeconds = Math.ceil(
                  (astroCost.metal - account.planetDetails[SUM_PLANET].resources.metal) /
                    account.planetDetails[SUM_PLANET].productions.metal
                );
                crystalSeconds = Math.ceil(
                  (astroCost.crystal - account.planetDetails[SUM_PLANET].resources.crystal) /
                    account.planetDetails[SUM_PLANET].productions.crystal
                );
                deuteriumSeconds = Math.ceil(
                  (astroCost.deuterium - account.planetDetails[SUM_PLANET].resources.deuterium) /
                    account.planetDetails[SUM_PLANET].productions.deuterium
                );
              }
              return (
                <div>
                  <Title>Astrophysique {astroLevel}</Title>
                  <Astrophysics name="M" cost={astroCost.metal} seconds={metalSeconds} />
                  <Astrophysics name="C" cost={astroCost.crystal} seconds={crystalSeconds} />
                  <Astrophysics name="D" cost={astroCost.deuterium} seconds={deuteriumSeconds} />
                </div>
              );
            })()}
          </div>
        )}
      </Container>
    </Fragment>
  );
};

const Title = styled.div`
  font-weight: bold;
  padding-bottom: 5px;
  font-size: 12px;
`;

const Container = styled.div`
  margin-top: 125px;
  color: #aaa;
  text-align: left;
  font-size: 10px;
`;

const Table = styled.table`
  border-collapse: collapse;
  th,
  td {
    padding: 0 4px;
  }
`;

const Line = styled.div`
  height: 60px;
  overflow: hidden;
`;
