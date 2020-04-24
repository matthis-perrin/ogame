import React, {FC} from 'react';
import styled from 'styled-components';

import {AccountTimelineView} from '@src/components/account_timeline_view';
import {AccountView} from '@src/components/account_view';
import {useAppStore} from '@src/lib/store';

export const App: FC = () => {
  const {selectedAccount, accountTimeline} = useAppStore();
  return (
    <Wrapper>
      <TimelineWrapper>
        {accountTimeline ? (
          <AccountTimelineView accountTimeline={accountTimeline} />
        ) : (
          <React.Fragment />
        )}
      </TimelineWrapper>
      <ContentWrapper>
        {selectedAccount ? <AccountView account={selectedAccount} /> : <React.Fragment />}
      </ContentWrapper>
    </Wrapper>
  );
};
App.displayName = 'App';

const timelineWidth = 500;

const Wrapper = styled.div`
  color: #ddd;
  font-family: Verdana, Arial, SunSans-Regular, sans-serif;
`;

const TimelineWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: ${timelineWidth}px;
  overflow-y: auto;
  background-color: black;
`;

const ContentWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: ${timelineWidth}px;
  overflow-y: auto;
  background-color: black;
`;
