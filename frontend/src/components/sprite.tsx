import styled from 'styled-components';

const SpriteBase = styled.div`
  background-repeat: no-repeat;
`;

export const Sprite = styled(SpriteBase)`
  background-image: url('./sprite.jpg');
  width: 200px;
  height: 200px;
  background-size: 4000px 6000px;
  zoom: 0.4;
  border-radius: 16px;
`;

export const UnitSprite = styled(SpriteBase)`
  background-image: url('./unit_sprite.png');
  width: 48px;
  height: 32px;
  background-size: 400px 192px;
`;
