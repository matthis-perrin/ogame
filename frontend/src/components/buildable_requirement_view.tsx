import React, {FC} from 'react';
import styled from 'styled-components';

import {BuildableRequirement} from '@shared/models/buildable';

export const BuildableRequirementView: FC<{requirement: BuildableRequirement}> = ({
  requirement,
}) => (
  <Wrapper>
    <Name>{requirement.entity.name}</Name>
    <Level>{requirement.level}</Level>
  </Wrapper>
);
BuildableRequirementView.displayName = 'BuildableRequirementView';

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
