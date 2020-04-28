import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {Account} from '@src/models/account';
import {COLOR_WHITE, COLOR_WHITEDARK} from '@src/models/constants';
import {Ghost} from '@src/models/ghost';
import {findPlanetName, PlanetId} from '@src/models/planets';
import {thousands, time} from '@src/ui/utils';

interface GhostProps {
  ghosts: {[planetId: string]: Ghost};
  planetId: PlanetId;
  account: Account;
}

export const GhostC: FC<GhostProps> = ({ghosts, planetId, account}) => {
  let ghost: Ghost | undefined;
  if (ghosts.hasOwnProperty(planetId)) {
    ghost = ghosts[planetId];
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const minSeconds = 7 * 3600;
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const maxSeconds = 9 * 3600;

  return (
    <Fragment>
      {ghost === undefined ? (
        ''
      ) : (
        <div>
          <div>
            {findPlanetName(account.planetList, ghost.destination)} > {thousands(ghost.distance)}
          </div>
          {ghost.speeds.map(ghostSpeed => (
            <Speed
              key={ghostSpeed.name}
              className={
                ghostSpeed.timeSeconds > minSeconds && ghostSpeed.timeSeconds < maxSeconds
                  ? 'active'
                  : ''
              }
            >
              {ghostSpeed.name}: {time(ghostSpeed.timeSeconds)}
            </Speed>
          ))}
        </div>
      )}
    </Fragment>
  );
};

const Speed = styled.div`
  color: ${COLOR_WHITEDARK};
  &.active {
    color: ${COLOR_WHITE};
  }
`;
