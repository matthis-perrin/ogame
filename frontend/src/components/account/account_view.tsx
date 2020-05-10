import React, {FC} from 'react';
import styled from 'styled-components';

import {Account} from '@shared/models/account';
import {AllTechnologies} from '@shared/models/technology';
import {arrayJoin} from '@shared/utils/array_utils';
import {substract} from '@shared/utils/type_utils';

import {BuildItemLine} from '@src/components/core/build_item_line';
import {PlanetView} from '@src/components/planet/planet_view';

export const AccountView: FC<{account: Account}> = ({account}) => {
  // const {currentTime} = account;
  const lineSeparator = (prefix: string) => (index: number) => (
    <LineSeparator key={`sep-${prefix}-${index}`} />
  );
  return (
    <Wrapper>
      <AccountWrapper>
        <BuildItemSectionTitle>Technology</BuildItemSectionTitle>
        <BuildItemSection>
          {arrayJoin(
            AllTechnologies.map(t => {
              const inProgress =
                account.inProgressTechnology?.technology === t
                  ? account.inProgressTechnology
                  : undefined;
              return (
                <BuildItemLine
                  buildable={t}
                  current={account.technologyLevels.get(t)}
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
      </AccountWrapper>
      {Array.from(account.planets.values())
        .sort((p1, p2) => p1.id.localeCompare(p2.id))
        .map(p => (
          <PlanetView style={{marginLeft: 32}} key={p.id} account={account} planet={p} />
        ))}
    </Wrapper>
  );
};
AccountView.displayName = 'AccountView';

const Wrapper = styled.div`
  display: flex;
  padding: 32px;
  overflow-x: auto;
`;

const AccountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #0d1014;
  padding: 16px;
  width: 400px;
`;

const BuildItemSection = styled.div``;
const BuildItemSectionTitle = styled.div`
  font-size: 20px;
  margin-bottom: 8px;
  color: #8b8b8b;
`;

const LineSeparator = styled.div`
  height: 8px;
`;
