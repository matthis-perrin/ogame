import React from 'react';
import styled from 'styled-components';

import {getPlanetProductionPerHour} from '@shared/lib/production';
import {Account} from '@shared/models/account';
import {InstallationBuildings, ResourcesBuilding} from '@shared/models/building';
import {Planet} from '@shared/models/planet';
import {timeToString} from '@shared/models/time';
import {arrayJoin} from '@shared/utils/array_utils';
import {substract} from '@shared/utils/type_utils';

import {BuildItemLine} from '@src/components/core/build_item_line';
import {CustomDiv} from '@src/components/core/react';
import {ResourcesView} from '@src/components/core/resources_view';

export const PlanetView: CustomDiv<{account: Account; planet: Planet}> = ({
  account,
  planet,
  ...props
}) => {
  const {id} = planet;
  const {energyConsumption, energyProduction} = getPlanetProductionPerHour(account, planet);
  const lineSeparator = (prefix: string) => (index: number) => (
    <LineSeparator key={`sep-${prefix}-${index}`} />
  );

  return (
    <Wrapper {...props}>
      <Header>
        <Title>{`Planète ${id}`}</Title>
        <ResourcesView
          resources={planet.resources}
          energy={substract(energyProduction, energyConsumption)}
          showAll
        />
      </Header>
      <BuildItemSectionTitle>Production</BuildItemSectionTitle>
      <BuildItemSection>
        {arrayJoin(
          ResourcesBuilding.map(b => {
            const inProgress =
              planet.inProgressBuilding?.building === b ? planet.inProgressBuilding : undefined;
            return (
              <BuildItemLine
                buildable={b}
                current={planet.buildingLevels.get(b)}
                inProgress={inProgress?.level}
                timeLeft={
                  inProgress ? substract(inProgress.endTime, account.currentTime) : undefined
                }
              />
            );
          }),
          lineSeparator('production')
        )}
      </BuildItemSection>
      <BuildItemSectionTitle>Installation</BuildItemSectionTitle>
      <BuildItemSection>
        {arrayJoin(
          InstallationBuildings.map(b => {
            const inProgress =
              planet.inProgressBuilding?.building === b ? planet.inProgressBuilding : undefined;
            return (
              <BuildItemLine
                buildable={b}
                current={planet.buildingLevels.get(b)}
                inProgress={inProgress?.level}
                timeLeft={
                  inProgress ? substract(inProgress.endTime, account.currentTime) : undefined
                }
              />
            );
          }),
          lineSeparator('installation')
        )}
      </BuildItemSection>
      {planet.ships.size === 0 ? (
        <React.Fragment />
      ) : (
        <React.Fragment>
          <BuildItemSectionTitle>Flotte</BuildItemSectionTitle>
          <BuildItemSection>
            {arrayJoin(
              Array.from(planet.ships.entries()).map(([ship, quantity]) => (
                <BuildItemLine buildable={ship} current={quantity} />
              )),
              lineSeparator('flotte')
            )}
          </BuildItemSection>
        </React.Fragment>
      )}
      {planet.inProgressShips === undefined ? (
        <React.Fragment />
      ) : (
        <React.Fragment>
          <BuildItemSectionTitle>{`Queue (ends in ${timeToString(
            substract(planet.inProgressShips.endTime, account.currentTime)
          )})`}</BuildItemSectionTitle>
          <BuildItemSection>
            {arrayJoin(
              planet.inProgressShips.ships.map(({ship, quantity}) => (
                <BuildItemLine buildable={ship} inProgress={quantity} />
              )),
              lineSeparator('flotte')
            )}
          </BuildItemSection>
        </React.Fragment>
      )}
      {planet.ships.size === 0 ? (
        <React.Fragment />
      ) : (
        <React.Fragment>
          <BuildItemSectionTitle>Defense</BuildItemSectionTitle>
          <BuildItemSection>
            {arrayJoin(
              Array.from(planet.defenses.entries()).map(([defense, quantity]) => (
                <BuildItemLine buildable={defense} current={quantity} />
              )),
              lineSeparator('defense')
            )}
          </BuildItemSection>
        </React.Fragment>
      )}
      {planet.inProgressDefenses === undefined ? (
        <React.Fragment />
      ) : (
        <React.Fragment>
          <BuildItemSectionTitle>{`Queue (ends in ${timeToString(
            substract(planet.inProgressDefenses.endTime, account.currentTime)
          )})`}</BuildItemSectionTitle>
          <BuildItemSection>
            {arrayJoin(
              planet.inProgressDefenses.defenses.map(({defense, quantity}) => (
                <BuildItemLine buildable={defense} inProgress={quantity} />
              )),
              lineSeparator('defense')
            )}
          </BuildItemSection>
        </React.Fragment>
      )}
    </Wrapper>
  );
};
PlanetView.displayName = 'PlanetView';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #0d1014;
  padding: 16px;
  width: 400px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  margin-bottom: 16px;
  background-color: #2e3e4e;
  padding: 8px;
`;

const BuildItemSection = styled.div``;
const BuildItemSectionTitle = styled.div`
  font-size: 20px;
  margin: 16px 0 8px 0;
  color: #8b8b8b;
`;

const LineSeparator = styled.div`
  height: 8px;
`;
