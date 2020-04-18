import React, {FC} from 'react';
import styled from 'styled-components';

import {BuildOrderItem} from '@shared/lib/build_order';

export const BuildOrderItemView: FC<{item: BuildOrderItem}> = ({item}) => (
  <Wrapper>
    <Name>{item.entity.name}</Name>
    <Level>{item.level}</Level>
  </Wrapper>
);
BuildOrderItemView.displayName = 'BuildOrderItemView';

const Wrapper = styled.div`
  display: flex;
  background-color: #ddddff;
  padding: 6px;
`;
const Name = styled.div`
  flex-grow: 1;
`;
const Level = styled.div`
  flex-shrink: 0;
`;
