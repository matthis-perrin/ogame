import React, {FC} from 'react';
import styled from 'styled-components';

import {getBuildItemCost} from '@shared/lib/build_items';
import {BuildItem} from '@shared/models/build_item';

import {ResourcesView} from '@src/components/core/resources_view';
import {Sprite} from '@src/components/core/sprite';

export const BuildItemView: FC<{buildItem: BuildItem}> = ({buildItem}) => {
  const metricText =
    buildItem.type === 'ship' || buildItem.type === 'defense'
      ? `x ${buildItem.quantity}`
      : `Niv. ${buildItem.level}`;

  return (
    <Wrapper>
      <Left>
        <Sprite
          style={{
            backgroundPosition: buildItem.buildable.sprite,
          }}
        />
      </Left>
      <Right>
        <Title>
          <Name>{buildItem.buildable.name}</Name>
          <Metric>{metricText}</Metric>
        </Title>
        <ResourcesView resources={getBuildItemCost(buildItem)} />
      </Right>

      {/* <Separator />
    <Reason>
      <ReasonTitle>Reason: </ReasonTitle>
      <ReasonContent>{transition.reason}</ReasonContent>
    </Reason>
    <Separator />
    <Events>
      <EventTitle>Events: </EventTitle>
      {transition.events.map(e => (
        <Event>{`- ${e}`}</Event>
      ))}
    </Events> */}
    </Wrapper>
  );
};
BuildItemView.displayName = 'BuildItemView';

const Wrapper = styled.div`
  display: flex;
`;

const Left = styled.div`
  flex-shrink: 0;
  margin-right: 16px;
`;

const Title = styled.div`
  display: flex;
  align-items: baseline;
`;

const Name = styled.div`
  margin-right: 12px;
`;
const Metric = styled.div`
  font-size: 14px;
  color: #999;
  flex-shrink: 0;
`;

const Right = styled.div`
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
