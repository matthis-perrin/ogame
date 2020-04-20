import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {COLOR_WHITE} from '@src/models/constants';

export const Separator: FC = () => (
  <Fragment>
    <Container />
  </Fragment>
);

const Container = styled.div`
  border-left: 1px solid ${COLOR_WHITE};
  margin: 0 10px;
`;
