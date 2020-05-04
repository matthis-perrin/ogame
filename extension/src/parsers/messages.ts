import $ from 'jquery';

import {Message} from '@src/models/messages';
import {PlanetCoords, PlanetName} from '@src/models/planets';
import {ResourceAmount} from '@src/models/resources';
import {sum} from '@src/ui/utils';
import {Metal, Crystal, Deuterium} from '@shared/models/stock';

const refresh = 500;

function readMessages(): HTMLElement[] | undefined {
  let res: HTMLElement[] | undefined;
  $('#mainContent > #contentWrapper li#tabs-nfFleets[aria-selected="true"]').each(() => {
    $('#mainContent > #contentWrapper #fleetsTab li#subtabs-nfFleet20[aria-selected="true"]').each(
      () => {
        $('#mainContent > #contentWrapper #fleetsTab #fleetsgenericpage').each(() => {
          res = [];
          $('#mainContent > #contentWrapper #fleetsTab #fleetsgenericpage .msg').each((_, msg) => {
            res?.push(msg);
          });
        });
      }
    );
  });
  return res;
}

const titleRegex = /^Rapport d`espionnage de (.*) (\[\d+:\d+:\d+\])$/;
const resourceRegex = /^(.*): (.*)$/;
const unitsRegex = /^Flottes: 0\nDéfense: 0$/;
const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;

export async function parseMessages(): Promise<Message[] | undefined> {
  return new Promise(resolve => {
    const res: Message[] = [];
    if (!document.location.search.includes('page=messages')) {
      return resolve(undefined);
    }
    const interval = setInterval(() => {
      const messages = readMessages();
      if (messages === undefined) {
        return;
      }
      clearInterval(interval);
      messages.forEach(msg => {
        const messageId = msg.getAttribute('data-msg-id');
        // eslint-disable-next-line no-null/no-null
        if (messageId === null) {
          return;
        }
        const jMsg = $(msg);
        const title = jMsg
          .find('.msg_title')
          .text()
          .trim();
        const match = titleRegex.exec(title);
        // eslint-disable-next-line no-null/no-null
        if (match === null) {
          return;
        }
        const dateRaw = jMsg
          .find('.msg_date')
          .text()
          .trim();
        const dateMatch = dateRegex.exec(dateRaw);
        // eslint-disable-next-line no-null/no-null
        if (dateMatch === null) {
          return;
        }
        const date = new Date();
        date.setDate(parseFloat(dateMatch[1]));
        date.setMonth(parseFloat(dateMatch[2]) - 1);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        date.setFullYear(parseFloat(dateMatch[3]));
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        date.setHours(parseFloat(dateMatch[4]));
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        date.setMinutes(parseFloat(dateMatch[5]));
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        date.setSeconds(parseFloat(dateMatch[6]));
        let metal = 0 as ResourceAmount;
        let crystal = 0 as ResourceAmount;
        let deuterium = 0 as ResourceAmount;
        jMsg.find('.resspan').each((_, e) => {
          const match2 = resourceRegex.exec(e.innerText);
          // eslint-disable-next-line no-null/no-null
          if (match2 === null) {
            return;
          }
          const resource = (parseFloat(match2[2].replace(/\./g, '')) / 2) as ResourceAmount;
          switch (match2[1]) {
            case Metal.name:
              metal = resource;
              break;
            case Crystal.name:
              crystal = resource;
              break;
            case Deuterium.name:
              deuterium = resource;
              break;
            default:
          }
        });
        const resourcesSum = sum([metal, crystal, deuterium]);
        let noUnits = false;
        jMsg.find('.compacting:eq(4)').each((_, e) => {
          const match2 = unitsRegex.exec(e.innerText);
          // eslint-disable-next-line no-null/no-null
          if (match2 !== null) {
            noUnits = true;
          }
        });
        res.push({
          messageId,
          planetName: match[1] as PlanetName,
          planetCoords: match[2] as PlanetCoords,
          resources: {metal, crystal, deuterium, sum: resourcesSum},
          noUnits,
          timeSeconds: Math.floor(date.getTime() / 1000),
        });
      });
      resolve(res);
    }, refresh);
  });
}
