import React, {FC} from 'react';
import styled from 'styled-components';

import {createNewAccount} from '@shared/lib/account';
import {Destroyer} from '@shared/models/ships';
import {Rosalind} from '@shared/models/universe';

import {AccountTimelineView} from '@src/components/account_timeline_view';
import {getAccountTimeline} from '@src/lib/timeline';

export const App: FC = () => (
  <Wrapper>
    <TimelineWrapper>
      <AccountTimelineView
        accountTimeline={getAccountTimeline(Destroyer, createNewAccount(Rosalind))}
      />
    </TimelineWrapper>
    <ContentWrapper></ContentWrapper>
  </Wrapper>
);
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
