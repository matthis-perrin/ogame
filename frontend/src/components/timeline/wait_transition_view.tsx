import React, {FC} from 'react';
import styled from 'styled-components';

import {timeToString} from '@shared/models/time';
import {WaitTransition} from '@shared/models/timeline';

export const WaitTransitionView: FC<{transition: WaitTransition}> = ({transition}) => (
  <Wrapper>
    <div>{`Waiting ${timeToString(transition.duration)}`}</div>
    <Separator />
    <Reason>
      <ReasonTitle>Reason: </ReasonTitle>
      <ReasonContent>{transition.reason}</ReasonContent>
    </Reason>
    <Separator />
    <Events>
      <EventTitle>Events: </EventTitle>
      {transition.events.map(e => (
        <Event key={e}>{`- ${e}`}</Event>
      ))}
    </Events>
  </Wrapper>
);
WaitTransitionView.displayName = 'WaitTransitionView';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-left-width: 6px;
  padding: 16px;
`;

const Separator = styled.div`
  height: 8px;
`;

const Reason = styled.div`
  font-size: 13px;
  color: #999;
`;

const ReasonTitle = styled.div`
  text-decoration: underline;
`;

const ReasonContent = styled.div`
  margin-top: 2px;
`;

const Events = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #999;
`;

const EventTitle = styled.div`
  text-decoration: underline;
`;

const Event = styled.div`
  margin-top: 2px;
`;
