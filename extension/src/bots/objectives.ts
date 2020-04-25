import {LargeCargo} from '@shared/models/ships';

import {ResourceTransfer} from '@src/models/objectives';
import {getFretCapacity} from '@src/models/technologies';
import {getAccount} from '@src/stores/account';

const BOT_LOOP_TIME = 1000;
let interval: number | undefined;
let currentTransfer: ResourceTransfer | undefined;

function handleTransfer(transfer: ResourceTransfer): void {
  console.log('handleTransfer', transfer.from, transfer.to);
}

function loop(): void {
  const account = getAccount();
  if (account === undefined || account.objectives === undefined) {
    return;
  }

  if (currentTransfer !== undefined) {
    handleTransfer(currentTransfer);
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

    currentTransfer = transfer;
    return;
  }
}

export function startObjectivesBot(): void {
  if (interval !== undefined) {
    return;
  }
  interval = setInterval(loop, BOT_LOOP_TIME);
}
