import React, {FC} from 'react';
import styled from 'styled-components';

import {Account} from '@shared/models/account';

export const AccountView: FC<{account: Account}> = ({account}) => {
  const {currentTime} = account;
  return <Wrapper>{currentTime}</Wrapper>;
};
AccountView.displayName = 'AccountView';

const Wrapper = styled.div``;
