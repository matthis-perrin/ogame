import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

export const BotOverlay: FC = () => (
  <Fragment>
    <Overlay>
      <Text>BOT IS WORKING</Text>
    </Overlay>
  </Fragment>
);

const Overlay = styled.div`
  position: fixed;
  display: block;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
`;

const Text = styled.div`
  font-size: 40px;
  margin-left: 200px;
  margin-top: 200px;
`;
