import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {snum} from '@src/ui/utils';

interface LootProps {
  name: string;
  amount: number;
}

export const Loot: FC<LootProps> = ({name, amount}) => (
  <Fragment>
    <LootContainer>
      {name}: {snum(amount)}
    </LootContainer>
  </Fragment>
);

const LootContainer = styled.div``;
