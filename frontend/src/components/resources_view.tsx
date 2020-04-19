import React, {FC} from 'react';
import styled from 'styled-components';

import {Resources} from '@shared/models/resource';

export const ResourcesView: FC<{resources: Resources}> = ({resources}) => {
  const {metal, crystal, deuterium} = resources;
  return (
    <Wrapper>{`M ${metal.toLocaleString()} - C ${crystal.toLocaleString()} - D ${deuterium.toLocaleString()}`}</Wrapper>
  );
};
ResourcesView.displayName = 'ResourcesView';

const Wrapper = styled.div``;
