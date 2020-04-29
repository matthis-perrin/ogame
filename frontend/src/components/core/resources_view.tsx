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
  small?: boolean;
}> = ({resources, energy, showAll, small}) => {
  const {metal, crystal, deuterium} = resources;
  const elements: JSX.Element[] = [];
  if (metal > 0 || showAll) {
    elements.push(<Metal key="metal" amount={metal} small={small} />);
  }
  if (crystal > 0 || showAll) {
    elements.push(<Crystal key="crystal" amount={crystal} small={small} />);
  }
  if (deuterium > 0 || showAll) {
    elements.push(<Deuterium key="deuterium" amount={deuterium} small={small} />);
  }
  if (energy !== undefined && (energy > 0 || showAll)) {
    elements.push(<Energy key="energy" amount={energy} small={small} />);
  }
  return (
    <ResourcesWrapper>
      {arrayJoin(elements, i => (
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        <Separator style={{width: small ? 12 : 16}} key={i} />
      ))}
    </ResourcesWrapper>
  );
};
ResourcesView.displayName = 'ResourcesView';

const ResourcesWrapper = styled.div`
  display: flex;
`;

const Separator = styled.div``;

//

export const Metal: FC<{amount: MetalAmount; small?: boolean}> = ({amount, small}) => (
  <UnitView type="metal" amount={amount} small={small} />
);
export const Crystal: FC<{amount: CrystalAmount; small?: boolean}> = ({amount, small}) => (
  <UnitView type="crystal" amount={amount} small={small} />
);
export const Deuterium: FC<{amount: DeuteriumAmount; small?: boolean}> = ({amount, small}) => (
  <UnitView type="deuterium" amount={amount} small={small} />
);
export const Energy: FC<{amount: EnergyAmount; small?: boolean}> = ({amount, small}) => (
  <UnitView type="energy" amount={amount} small={small} />
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

  if (amount >= 1000 * 1000 * 1000) {
    amountToDisplay = amount / (1000 * 1000 * 1000);
    suffix = 'G';
  } else if (amount >= 1000 * 1000) {
    amountToDisplay = amount / (1000 * 1000);
    suffix = 'M';
  } else if (amount >= 10 * 1000) {
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
  small?: boolean;
}> = ({type, amount, small}) => {
  const Amount = amount < 0 ? NegativeAmount : PositiveAmount;
  const UnitViewWrapper = small ? RowUnitViewWrapper : ColumnUnitViewWrapper;
  const AmountWrapper = small ? RowAmountWrapper : ColumnAmountWrapper;
  return (
    <UnitViewWrapper>
      <UnitSprite
        size={small ? 'small' : 'normal'}
        style={{backgroundPosition: getBackgroundPosition(type)}}
      />
      <AmountWrapper>
        <Amount>{amountToString(Math.floor(amount))}</Amount>
      </AmountWrapper>
    </UnitViewWrapper>
  );
};
UnitView.displayName = 'UnitView';

const ColumnUnitViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RowUnitViewWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ColumnAmountWrapper = styled.div`
  margin-top: 4px;
  font-size: 14px;
`;
const RowAmountWrapper = styled.div`
  margin-left: 4px;
  font-size: 13px;
`;

const NegativeAmount = styled.div`
  color: #f44;
`;
const PositiveAmount = styled.div`
  color: #999;
`;
