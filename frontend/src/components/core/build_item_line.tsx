import React, {FC} from 'react';
import styled from 'styled-components';

import {Buildable} from '@shared/models/buildable';
import {multiplyResources} from '@shared/models/resource';
import {Milliseconds, timeToString} from '@shared/models/time';

import {ResourcesView} from '@src/components/core/resources_view';
import {Sprite} from '@src/components/core/sprite';

export const BuildItemLine: FC<{
  buildable: Buildable;
  current?: number;
  inProgress?: number;
  endTime?: Milliseconds;
}> = props => {
  const {buildable, current, inProgress, endTime} = props;
  const metricValue = current ?? 0;
  const metricText =
    buildable.type === 'building' || buildable.type === 'technology'
      ? `lvl ${metricValue}`
      : `x ${current ?? inProgress ?? 0}`;
  const WrapperClass =
    current === undefined && inProgress === undefined ? DisabledWrapper : Wrapper;

  const nextResources =
    buildable.type === 'building' || buildable.type === 'technology'
      ? buildable.cost(metricValue + 1)
      : multiplyResources(buildable.cost, inProgress ?? 1);
  const prefix =
    buildable.type === 'building' || buildable.type === 'technology'
      ? `Level ${metricValue + 1}:`
      : inProgress !== undefined
      ? 'Cost:'
      : 'Unit cost:';

  let subtitle = <React.Fragment />;

  if (current !== undefined && inProgress !== undefined) {
    let inProgressStr =
      buildable.type === 'building' || buildable.type === 'technology'
        ? `Level ${metricValue + 1} in progress`
        : `${metricValue}x in progress`;
    if (endTime !== undefined) {
      inProgressStr += ` (end in ${timeToString(endTime)})`;
    }
    subtitle = <InProgressText>{inProgressStr}</InProgressText>;
  } else {
    subtitle = (
      <React.Fragment>
        <SubTitlePrefix>{prefix}</SubTitlePrefix>
        <ResourcesView small resources={nextResources} />
      </React.Fragment>
    );
  }

  return (
    <WrapperClass>
      <Left>
        <Sprite
          size="small"
          style={{
            backgroundPosition: buildable.sprite,
          }}
        />
      </Left>
      <Right>
        <Title>
          <Name>{buildable.name}</Name>
          <Metric>{metricText}</Metric>
        </Title>
        <SubTitle>{subtitle}</SubTitle>
      </Right>
    </WrapperClass>
  );
};
BuildItemLine.displayName = 'BuildItemLine';

const Wrapper = styled.div`
  display: flex;
  background-color: #2e3e4e;
  padding: 8px;
`;

const DisabledWrapper = styled(Wrapper)`
  opacity: 0.5;
`;

const Left = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-right: 12px;
`;

const Title = styled.div`
  display: flex;
  align-items: baseline;
`;

const Name = styled.div`
  margin-right: 12px;
`;
const Metric = styled.div`
  font-size: 13px;
  background-color: #10181f;
  border-radius: 4px;
  color: white;
  padding: 2px 8px;
`;

const Right = styled.div`
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SubTitle = styled.div`
  display: flex;
  align-items: center;
`;
const SubTitlePrefix = styled.div`
  margin-right: 6px;
  font-size: 14px;
  color: #999;
`;

const InProgressText = styled.div`
  font-size: 14px;
`;
