import React, {FC} from 'react';
import styled from 'styled-components';

import {buildItemCost} from '@shared/lib/build_items';
import {BuildItem} from '@shared/models/build_item';
import {BuildableType} from '@shared/models/buildable';
import {neverHappens} from '@shared/utils/type_utils';

import {ResourcesView} from '@src/components/resources_view';

function colorForBuildableType(type: BuildableType): string {
  if (type === 'building') {
    return '#2196F3';
  }
  if (type === 'technology') {
    return '#9C27B0';
  }
  if (type === 'defense') {
    return '#009688';
  }
  if (type === 'ship') {
    return '#FF9800';
  }
  neverHappens(type, `Could not get the color of the BuildableType "${type}"`);
}

export const BuildItemView: FC<{item: BuildItem}> = ({item}) => (
  <Wrapper style={{borderLeft: `solid 6px ${colorForBuildableType(item.buildable.type)}`}}>
    <Name>{item.buildable.name}</Name>
    <Metric>
      {item.type === 'technology' || item.type === 'building'
        ? `lvl ${item.level}`
        : `x ${item.quantity}`}
    </Metric>
    <Cost>
      <ResourcesView resources={buildItemCost(item)} />
    </Cost>
  </Wrapper>
);
BuildItemView.displayName = 'BuildItemView';

const Wrapper = styled.div`
  display: flex;
  background-color: #ddddff;
  padding: 6px;
`;
const Name = styled.div`
  flex-shrink: 0;
`;
const Metric = styled.div`
  flex-grow: 1;
  margin: 0 12px;
`;
const Cost = styled.div`
  flex-shrink: 0;
`;
