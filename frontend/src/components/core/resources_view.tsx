import React, {FC} from 'react';
import styled from 'styled-components';

import {
  CrystalAmount,
  DeuteriumAmount,
  EnergyAmount,
  MetalAmount,
  Resources,
} from '@shared/models/resource';
import {arrayJoin} from '@shared/utils/array_utils';
import {neverHappens} from '@shared/utils/type_utils';

import {UnitSprite} from '@src/components/core/sprite';

export const ResourcesView: FC<{
  resources: Resources;
  energy?: EnergyAmount;
  showAll?: boolean;
}> = ({resources, energy, showAll}) => {
  const {metal, crystal, deuterium} = resources;
  const elements: JSX.Element[] = [];
  if (metal > 0 || showAll) {
    elements.push(<Metal key="metal" amount={metal} />);
  }
  if (crystal > 0 || showAll) {
    elements.push(<Crystal key="crystal" amount={crystal} />);
  }
  if (deuterium > 0 || showAll) {
    elements.push(<Deuterium key="deuterium" amount={deuterium} />);
  }
  if (energy !== undefined && (energy > 0 || showAll)) {
    elements.push(<Energy key="energy" amount={energy} />);
  }
  return (
    <ResourcesWrapper>
      {arrayJoin(elements, i => (
        <Separator key={i} />
      ))}
    </ResourcesWrapper>
  );
};
ResourcesView.displayName = 'ResourcesView';

const ResourcesWrapper = styled.div`
  display: flex;
`;

const Separator = styled.div`
  width: 16px;
`;

//

export const Metal: FC<{amount: MetalAmount}> = ({amount}) => (
  <UnitView type="metal" amount={amount} />
);
export const Crystal: FC<{amount: CrystalAmount}> = ({amount}) => (
  <UnitView type="crystal" amount={amount} />
);
export const Deuterium: FC<{amount: DeuteriumAmount}> = ({amount}) => (
  <UnitView type="deuterium" amount={amount} />
);
export const Energy: FC<{amount: EnergyAmount}> = ({amount}) => (
  <UnitView type="energy" amount={amount} />
);

//

type UnitType = 'metal' | 'crystal' | 'deuterium' | 'energy';

function getBackgroundPosition(unit: UnitType): string {
  if (unit === 'metal') {
    return '0 -160px';
  }
  if (unit === 'crystal') {
    return '-48px -160px';
  }
  if (unit === 'deuterium') {
    return '-96px -160px';
  }
  if (unit === 'energy') {
    return '-144px -160px';
  }
  neverHappens(unit, `Unknown unit type ${unit}`);
}

function amountToString(amount: number): string {
  let amountToDisplay = amount;
  let suffix = '';

  if (amount > 1000 * 1000 * 1000) {
    amountToDisplay = amount / (1000 * 1000 * 1000);
    suffix = 'G';
  } else if (amount > 1000 * 1000) {
    amountToDisplay = amount / (1000 * 1000);
    suffix = 'M';
  } else if (amount > 10 * 1000) {
    amountToDisplay = amount / 1000;
    suffix = 'K';
  } else {
    return amountToDisplay.toLocaleString();
  }
  return `${amountToDisplay.toLocaleString(undefined, {
    maximumSignificantDigits: 3,
  })}${suffix}`;
}

const UnitView: FC<{
  type: UnitType;
  amount: number;
}> = ({type, amount}) => {
  const AmountClass = amount < 0 ? NegativeAmount : PositiveAmount;
  return (
    <UnitViewWrapper>
      <UnitSprite style={{backgroundPosition: getBackgroundPosition(type)}} />
      <AmountClass>{amountToString(Math.floor(amount))}</AmountClass>
    </UnitViewWrapper>
  );
};
UnitView.displayName = 'UnitView';

const UnitViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Amount = styled.div`
  font-size: 14px;
  margin-top: 4px;
`;

const NegativeAmount = styled(Amount)`
  color: #f44;
`;
const PositiveAmount = styled(Amount)`
  color: #999;
`;
