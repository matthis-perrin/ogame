import React from 'react';
import styled from 'styled-components';

import {neverHappens} from '@shared/utils/type_utils';

import {CustomDiv} from '@src/components/core/props';

const SpriteBase = styled.div`
  background-repeat: no-repeat;
`;

//
// Buildable Sprite
//

type SpriteSize = 'small' | 'normal';

/* eslint-disable @typescript-eslint/no-magic-numbers */
function getSpriteZoom(size: SpriteSize): number {
  if (size === 'small') {
    return 0.21;
  } else if (size === 'normal') {
    return 0.4;
  }
  neverHappens(size, `Unknown size ${size}`);
}
/* eslint-enable @typescript-eslint/no-magic-numbers */

export const Sprite: CustomDiv<{size: SpriteSize}> = ({size, ...props}) => (
  <SpriteWrapper {...props} style={{...(props.style ?? {}), zoom: getSpriteZoom(size)}} />
);
Sprite.displayName = 'Sprite';

export const SpriteWrapper = styled(SpriteBase)`
  background-image: url('./sprite.jpg');
  width: 200px;
  height: 200px;
  background-size: 4000px 6000px;
  zoom: 0.4;
  border-radius: 16px;
`;

//
// Unit Sprite
//

type UnitSpriteSize = 'small' | 'normal';

/* eslint-disable @typescript-eslint/no-magic-numbers */
function getUnitSpriteZoom(size: UnitSpriteSize): number {
  if (size === 'small') {
    return 0.5;
  } else if (size === 'normal') {
    return 1;
  }
  neverHappens(size, `Unknown size ${size}`);
}
/* eslint-enable @typescript-eslint/no-magic-numbers */

export const UnitSprite: CustomDiv<{size: UnitSpriteSize}> = ({size, ...props}) => (
  <UnitSpriteWrapper {...props} style={{...(props.style ?? {}), zoom: getUnitSpriteZoom(size)}} />
);
UnitSprite.displayName = 'UnitSprite';

export const UnitSpriteWrapper = styled(SpriteBase)`
  background-image: url('./unit_sprite.png');
  width: 48px;
  height: 32px;
  border-radius: 6px;
  background-size: 400px 192px;
`;
