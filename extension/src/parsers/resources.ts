import $ from 'jquery';

import {Resources} from '@src/models/resources';

const regex = /reloadResources\((.*)\);/;

export function parseResources(): Resources | undefined {
  let res: Resources | undefined;
  $('html > body #resourcesbarcomponent script').each((_, element) => {
    const match = regex.exec(element.innerText);
    // eslint-disable-next-line no-null/no-null
    if (match !== null) {
      try {
        res = JSON.parse(match[1]) as Resources;
        // eslint-disable-next-line no-empty
      } catch {}
    }
  });
  return res;
}
