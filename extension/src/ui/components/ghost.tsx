import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {goToUrl, sendGhostUrl} from '@src/controllers/navigator';
import {Account} from '@src/models/account';
import {Ghost, GhostSpeed} from '@src/models/ghost';
import {findPlanetCoords, findPlanetName, PlanetId} from '@src/models/planets';
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

  let ghostSpeed: GhostSpeed | undefined;
  if (ghost !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const minSeconds = 7.5 * 3600;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const maxSeconds = 8 * 3600;
    for (const gs of ghost.speeds) {
      if (gs.timeSeconds > minSeconds && gs.timeSeconds < maxSeconds) {
        ghostSpeed = gs;
        break;
      }
    }
  }

  return (
    <Fragment>
      {ghost === undefined ? (
        ''
      ) : (
        <Hover
          onClick={() => {
            if (ghost === undefined || ghostSpeed === undefined) {
              return;
            }
            const coords = findPlanetCoords(account.planetList, ghost.destination);
            goToUrl(sendGhostUrl(planetId, coords, ghostSpeed.techId, ghostSpeed.speedModifier));
          }}
        >
          <div>
            {findPlanetName(account.planetList, ghost.destination)} > {thousands(ghost.distance)}
          </div>
          <div>
            {ghostSpeed === undefined
              ? 'Nothing compatible'
              : `${ghostSpeed.name}: ${time(ghostSpeed.timeSeconds)}`}
          </div>
        </Hover>
      )}
    </Fragment>
  );
};

const Hover = styled.div`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
