import {ESP_DEBRIS, GT_DEBRIS, PT_DEBRIS, REC_DEBRIS} from '@src/models/constants';
import {ResourceAmount} from '@src/models/resources';
import {Tech} from '@src/models/tech';
import {Technology} from '@src/models/technologies';

export function sum(amounts: (ResourceAmount | number)[]): ResourceAmount {
  let internalSum = 0;
  for (const amount of amounts) {
    internalSum += amount;
  }
  return internalSum as ResourceAmount;
}

export function snum(value: number): string {
  let units = value;
  let unitName = '';
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  if (units >= 1000000) {
    unitName = 'M';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    units = Math.floor(units / 1000) / 1000;
  } else if (units >= 1000) {
    unitName = 'k';
    units = Math.floor(units / 1000);
  } else {
    units = Math.floor(units);
  }
  return `${units}${unitName}`;
}

export function calcFleetLoot(technologies: {[techId: string]: Technology}): number {
  const pt = technologies.hasOwnProperty(Tech.TransporterSmall)
    ? technologies[Tech.TransporterSmall].value * PT_DEBRIS
    : 0;
  const gt = technologies.hasOwnProperty(Tech.TransporterLarge)
    ? technologies[Tech.TransporterLarge].value * GT_DEBRIS
    : 0;
  const rec = technologies.hasOwnProperty(Tech.Recycler)
    ? technologies[Tech.Recycler].value * REC_DEBRIS
    : 0;
  const esp = technologies.hasOwnProperty(Tech.EspionageProbe)
    ? technologies[Tech.EspionageProbe].value * ESP_DEBRIS
    : 0;
  return pt + gt + rec + esp;
}
