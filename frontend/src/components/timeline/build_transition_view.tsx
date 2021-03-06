import React, {FC} from 'react';
import styled from 'styled-components';

import {BuildTransition} from '@shared/models/timeline';

import {BuildItemView} from '@src/components/core/build_item_view';

export const BuildTransitionView: FC<{transition: BuildTransition}> = ({transition}) => (
  <Wrapper>
    <BuildItemView buildItem={transition.buildItem} />
  </Wrapper>
);

BuildTransitionView.displayName = 'BuildTransitionView';

const Wrapper = styled.div`
  padding: 16px;
`;
