import React, {FC} from 'react';
import styled from 'styled-components';

import {Account} from '@shared/models/account';
import {timeToString} from '@shared/models/time';

import {PlanetView} from '@src/components/planet/planet_view';

export const AccountView: FC<{account: Account}> = ({account}) => {
  const {currentTime} = account;
  return (
    <Wrapper>
      <AccountWrapper>{`Account at ${timeToString(currentTime)}`}</AccountWrapper>
      <PlanetsWrapper>
        {Array.from(account.planets.values())
          .sort((p1, p2) => p1.id.localeCompare(p2.id))
          .map(p => (
            <PlanetView planet={p} />
          ))}
      </PlanetsWrapper>
    </Wrapper>
  );
};
AccountView.displayName = 'AccountView';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px;
`;

const AccountWrapper = styled.div``;

const PlanetsWrapper = styled.div`
  display: flex;
`;
