import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {useAccount} from '@src/stores/account';
import {Aggregation} from '@src/ui/aggregation';
import {Constructions} from '@src/ui/constructions';
import {Empire} from '@src/ui/empire';
import {Research} from '@src/ui/research';

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
              <Constructions account={account} />
            </Middle>
            <Research account={account} />
          </div>
        )}
      </Container>
    </Fragment>
  );
};

const Top = styled.div`
  height: 105px;
  padding-top: 20px;
`;

const Middle = styled.div`
  display: flex;
`;

const Container = styled.div`
  color: #aaa;
  text-align: left;
  font-size: 10px;
  margin-left: 5px;
`;
