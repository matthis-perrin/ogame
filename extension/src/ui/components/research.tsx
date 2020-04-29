import React, {FC, Fragment} from 'react';

import {
  ArmourTechnology,
  AstrophysicsTechnology,
  CombustionDrive,
  ComputerTechnology,
  EspionageTechnology,
  HyperspaceDrive,
  HyperspaceTechnology,
  ImpulseDrive,
  IntergalacticResearchNetworkTechnology,
  PlasmaTechnology,
  ShieldingTechnology,
  WeaponTechnology,
} from '@shared/models/technology';

import {Account} from '@src/models/account';
import {Table} from '@src/ui/common';
import {TechnologyC} from '@src/ui/components/technology';

interface ResearchProps {
  account: Account;
}

export const Research: FC<ResearchProps> = ({account}) => (
  <Fragment>
    <Table>
      <tbody>
        <tr>
          <td>
            <TechnologyC
              name={IntergalacticResearchNetworkTechnology.shortName}
              technologies={account.accountTechnologies}
              techId={IntergalacticResearchNetworkTechnology.id}
              planetId={account.currentPlanetId}
            />
            <TechnologyC
              name={PlasmaTechnology.shortName}
              technologies={account.accountTechnologies}
              techId={PlasmaTechnology.id}
              planetId={account.currentPlanetId}
            />
            <TechnologyC
              name={ComputerTechnology.shortName}
              technologies={account.accountTechnologies}
              techId={ComputerTechnology.id}
              planetId={account.currentPlanetId}
            />
            <TechnologyC
              name={AstrophysicsTechnology.shortName}
              technologies={account.accountTechnologies}
              techId={AstrophysicsTechnology.id}
              planetId={account.currentPlanetId}
            />
          </td>
          <td>
            <TechnologyC
              name={HyperspaceTechnology.shortName}
              technologies={account.accountTechnologies}
              techId={HyperspaceTechnology.id}
              planetId={account.currentPlanetId}
            />
            <TechnologyC
              name={CombustionDrive.shortName}
              technologies={account.accountTechnologies}
              techId={CombustionDrive.id}
              planetId={account.currentPlanetId}
            />
            <TechnologyC
              name={ImpulseDrive.shortName}
              technologies={account.accountTechnologies}
              techId={ImpulseDrive.id}
              planetId={account.currentPlanetId}
            />
            <TechnologyC
              name={HyperspaceDrive.shortName}
              technologies={account.accountTechnologies}
              techId={HyperspaceDrive.id}
              planetId={account.currentPlanetId}
            />
          </td>
          <td>
            <TechnologyC
              name={EspionageTechnology.shortName}
              technologies={account.accountTechnologies}
              techId={EspionageTechnology.id}
              planetId={account.currentPlanetId}
            />
            <TechnologyC
              name={WeaponTechnology.shortName}
              technologies={account.accountTechnologies}
              techId={WeaponTechnology.id}
              planetId={account.currentPlanetId}
            />
            <TechnologyC
              name={ShieldingTechnology.shortName}
              technologies={account.accountTechnologies}
              techId={ShieldingTechnology.id}
              planetId={account.currentPlanetId}
            />
            <TechnologyC
              name={ArmourTechnology.shortName}
              technologies={account.accountTechnologies}
              techId={ArmourTechnology.id}
              planetId={account.currentPlanetId}
            />
          </td>
        </tr>
      </tbody>
    </Table>
  </Fragment>
);
