import React, {FC} from 'react';
import styled from 'styled-components';

import {AccountView} from '@src/components/account/account_view';
import {Timeline} from '@src/components/timeline_v2/timeline';
import {AccountTimelineView} from '@src/components/timeline/account_timeline_view';
import {useAppStore} from '@src/lib/store';

export const App: FC = () => {
  const {selectedAccount, accountTimeline} = useAppStore();
  return (
    <Wrapper>
      <TimelineWrapperV2>
        {accountTimeline ? <Timeline accountTimeline={accountTimeline} /> : <React.Fragment />}
      </TimelineWrapperV2>
      <TimelineWrapper>
        {accountTimeline ? (
          <React.Fragment />
        ) : (
          // <AccountTimelineView accountTimeline={accountTimeline} />
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
  top: 200px;
  left: 0;
  bottom: 0;
  width: ${timelineWidth}px;
  overflow-y: auto;
  background-color: black;
`;

const TimelineWrapperV2 = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 200px;
  right: 20px;
  background-color: black;
`;

const ContentWrapper = styled.div`
  position: fixed;
  top: 200px;
  right: 0;
  bottom: 0;
  left: ${timelineWidth}px;
  overflow-y: auto;
  background-color: black;
`;
