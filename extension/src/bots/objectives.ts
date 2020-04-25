import {LargeCargo} from '@shared/models/ships';

import {runScript} from '@src/controllers/function';
import {sendLargeCargos} from '@src/controllers/navigator';
import {MissionTypeEnum} from '@src/models/fleets';
import {ResourceTransfer} from '@src/models/objectives';
import {findPlanetCoords} from '@src/models/planets';
import {getFretCapacity} from '@src/models/technologies';
import {getAccount, setAccount} from '@src/stores/account';

export enum BotTransferStep {
  GoToFleet,
  ValidateShips,
  ValidateCoords,
  ValidateResources,
  WaitingValidation,
}

export interface BotTransfer {
  transfer: ResourceTransfer;
  step: BotTransferStep;
}

const BOT_LOOP_TIME = 500;
let interval: number | undefined;

function handleTransfer(): void {
  const account = getAccount();
  if (account === undefined) {
    return;
  }
  const bt = account.bots.objectives;
  if (bt === undefined) {
    return;
  }

  switch (bt.step) {
    case BotTransferStep.GoToFleet:
      bt.step = BotTransferStep.ValidateShips;
      setAccount(account);
      const fretGt = getFretCapacity(account.accountTechnologies, LargeCargo);
      const requiredGt = Math.ceil(bt.transfer.resources.sum / fretGt);
      sendLargeCargos(
        bt.transfer.from,
        findPlanetCoords(account.planetList, bt.transfer.to),
        MissionTypeEnum.Deployment,
        requiredGt,
        bt.transfer.resources
      );
      break;
    case BotTransferStep.ValidateShips:
      bt.step = BotTransferStep.ValidateCoords;
      setAccount(account);
      runScript(`if($('#fleet1').is(':visible')){fleetDispatcher.trySubmitFleet1();}`);
      break;
    case BotTransferStep.ValidateCoords:
      bt.step = BotTransferStep.ValidateResources;
      setAccount(account);
      runScript(`if($('#fleet2').is(':visible')){fleetDispatcher.trySubmitFleet2();}`);
      break;
    case BotTransferStep.ValidateResources:
      bt.step = BotTransferStep.WaitingValidation;
      setAccount(account);
      runScript(
        `fleetDispatcher.updateCargo();fleetDispatcher.refreshCargo();fleetDispatcher.trySubmitFleet3();`
      );
      break;
    case BotTransferStep.WaitingValidation:
      if (account.objectives !== undefined) {
        for (const transfer of account.objectives.resourceTransfers) {
          if (
            transfer.from === bt.transfer.from &&
            transfer.to === bt.transfer.to &&
            transfer.isTransferring
          ) {
            account.bots.objectives = undefined;
            setAccount(account);
            return;
          }
        }
      }
      break;
    default:
  }
}

function loop(): void {
  const account = getAccount();
  if (
    account === undefined ||
    account.objectives === undefined ||
    account.objectives.startTime === undefined
  ) {
    return;
  }

  if (account.bots.objectives !== undefined) {
    handleTransfer();
    return;
  }

  const nowSeconds = Math.floor(new Date().getTime() / 1000);
  const fretGt = getFretCapacity(account.accountTechnologies, LargeCargo);

  for (const transfer of account.objectives.resourceTransfers) {
    if (transfer.isTransferring) {
      continue;
    }

    const sendInSeconds =
      Math.max(0, (account.objectives?.readyTimeSeconds.max ?? 0) - nowSeconds) +
      Math.max(
        0,
        (account.objectives?.startTime !== undefined
          ? account.objectives.startTime - nowSeconds
          : 0) + transfer.sendInSeconds
      );
    if (sendInSeconds !== 0) {
      continue;
    }

    const requiredGt = Math.ceil(transfer.resources.sum / fretGt);
    let gtAmount = 0;
    if (account.planetDetails.hasOwnProperty(transfer.from)) {
      const planet = account.planetDetails[transfer.from];
      gtAmount = planet.ships.hasOwnProperty(LargeCargo.id) ? planet.ships[LargeCargo.id].value : 0;
    }
    if (requiredGt > gtAmount) {
      continue;
    }

    account.bots.objectives = {transfer, step: BotTransferStep.GoToFleet};
    setAccount(account);
    return;
  }
}

export function startObjectivesBot(): void {
  if (interval !== undefined) {
    return;
  }
  interval = setInterval(loop, BOT_LOOP_TIME);
}
