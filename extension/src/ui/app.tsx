import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {COLOR_WHITE} from '@src/models/constants';
import {useAccount} from '@src/stores/store_account';
import {Aggregation} from '@src/ui/aggregation';
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
            <Top>
              <Aggregation account={account} />
            </Top>
            <Middle>
              <Empire account={account} />
              <Separator />
              <ObjectivesC account={account} />
            </Middle>
            <Bottom>
              <Constructions account={account} />
              <Separator />
              <Fleets account={account} />
              <Separator />
              <Messages account={account} />
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
