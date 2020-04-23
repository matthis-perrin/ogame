import React, {FC} from 'react';
import styled from 'styled-components';

import {Account} from '@shared/models/account';
import {timeToString} from '@shared/models/time';
import {AccountTimeline} from '@shared/models/timeline';

import {BuildTransitionView} from '@src/components/build_transition_view';
import {WaitTransitionView} from '@src/components/wait_transition_view';

export const AccountTimelineView: FC<{accountTimeline: AccountTimeline}> = ({accountTimeline}) => {
  const {start, transitions} = accountTimeline;
  const totalTime = transitions[transitions.length - 1].transitionnedAccount.currentTime;
  return (
    <Wrapper>
      <Header>
        <Title>Timeline</Title>
        <SubTitle>{`Total: ${timeToString(totalTime)}`}</SubTitle>
      </Header>
      <AccountTime account={start}></AccountTime>
      {transitions.map(({transition, transitionnedAccount}) => (
        <React.Fragment key={Math.random()}>
          {transition.type === 'wait' ? (
            <WaitTransitionView transition={transition} />
          ) : (
            <BuildTransitionView transition={transition} />
          )}
          <AccountTime account={transitionnedAccount} />
        </React.Fragment>
      ))}
    </Wrapper>
  );
};
AccountTimelineView.displayName = 'AccountTimelineView';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.div`
  font-size: 20px;
  margin-bottom: 4px;
`;
const SubTitle = styled.div`
  font-size: 15px;
  color: #aaa;
`;

export const AccountTime: FC<{account: Account}> = ({account}) => {
  const {currentTime} = account;
  return <TimeWrapper>{currentTime === 0 ? 'START' : timeToString(currentTime)}</TimeWrapper>;
};
AccountTime.displayName = 'AccountTime';

const TimeWrapper = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff33;
`;
