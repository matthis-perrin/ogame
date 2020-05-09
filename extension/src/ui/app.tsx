import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {COLOR_WHITE} from '@src/models/constants';
import {useAccount} from '@src/stores/account';
import {Aggregation} from '@src/ui/aggregation';
import {BotOverlay} from '@src/ui/botoverlay';
import {Colonies} from '@src/ui/components/colonies';
import {Separator} from '@src/ui/components/separator';
import {Constructions} from '@src/ui/constructions';
import {Empire} from '@src/ui/empire';
import {Fleets} from '@src/ui/fleets';
import {Messages} from '@src/ui/messages';
import {ObjectivesC} from '@src/ui/objectives';

export const App: FC = () => {
  const [account] = useAccount();
  return (
    <Fragment>
      <Container>
        {account === undefined ? (
          ''
        ) : (
          <div>
            {account.bots.objectives !== undefined ? <BotOverlay /> : ''}
            <Top>
              <Aggregation account={account} />
            </Top>
            <Middle>
              <Empire account={account} />
            </Middle>
            <Bottom>
              <Messages account={account} />
              <Separator />
              <Fleets account={account} />
              <Separator />
              <Constructions account={account} />
              <Separator />
              <ObjectivesC account={account} />
              {account.bots.colonies ? <Separator /> : ''}
              {account.bots.colonies ? <Colonies account={account} /> : ''}
            </Bottom>
          </div>
        )}
      </Container>
    </Fragment>
  );
};

const Top = styled.div`
  height: 105px;
  padding-top: 20px;
  display: flex;
`;

const Middle = styled.div`
  display: flex;
`;

const Bottom = styled.div`
  display: flex;
`;

const Container = styled.div`
  color: ${COLOR_WHITE};
  text-align: left;
  font-size: 10px;
  margin-left: 5px;
`;
