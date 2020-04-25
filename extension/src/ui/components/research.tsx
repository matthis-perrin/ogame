import React, {FC, Fragment} from 'react';

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

import {Account} from '@src/models/account';
import {findResearchPlanet} from '@src/models/planets';
import {Table} from '@src/ui/common';
import {TechnologyC} from '@src/ui/components/technology';

interface ResearchProps {
  account: Account;
}

export const Research: FC<ResearchProps> = ({account}) => {
  const planetId = findResearchPlanet(account);
  return (
    <Fragment>
      {planetId === undefined ? (
        ''
      ) : (
        <Table>
          <tbody>
            <tr>
              <td>
                <TechnologyC
                  name={EnergyTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={EnergyTechnology.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={LaserTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={LaserTechnology.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={IonTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={IonTechnology.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={HyperspaceTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={HyperspaceTechnology.id}
                  planetId={planetId}
                />
              </td>
              <td>
                <TechnologyC
                  name={PlasmaTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={PlasmaTechnology.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={CombustionDrive.shortName}
                  technologies={account.accountTechnologies}
                  techId={CombustionDrive.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={ImpulseDrive.shortName}
                  technologies={account.accountTechnologies}
                  techId={ImpulseDrive.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={HyperspaceDrive.shortName}
                  technologies={account.accountTechnologies}
                  techId={HyperspaceDrive.id}
                  planetId={planetId}
                />
              </td>
              <td>
                <TechnologyC
                  name={EspionageTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={EspionageTechnology.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={ComputerTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={ComputerTechnology.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={AstrophysicsTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={AstrophysicsTechnology.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={IntergalacticResearchNetworkTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={IntergalacticResearchNetworkTechnology.id}
                  planetId={planetId}
                />
              </td>
              <td>
                <TechnologyC
                  name={GravitonTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={GravitonTechnology.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={WeaponTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={WeaponTechnology.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={ShieldingTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={ShieldingTechnology.id}
                  planetId={planetId}
                />
                <TechnologyC
                  name={ArmourTechnology.shortName}
                  technologies={account.accountTechnologies}
                  techId={ArmourTechnology.id}
                  planetId={planetId}
                />
              </td>
            </tr>
          </tbody>
        </Table>
      )}
    </Fragment>
  );
};