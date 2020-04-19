import $ from 'jquery';

import {Meta, MetaContent, MetaName} from '@src/models/meta';

export function parseMeta(): Meta[] {
  const res: Meta[] = [];
  $('html > head > meta').each((index, element) => {
    const name = element.getAttribute('name');
    const content = element.getAttribute('content');
    // eslint-disable-next-line no-null/no-null
    if (name !== null && content !== null && name.startsWith('ogame-')) {
      res.push({
        name: name as MetaName,
        content: content as MetaContent,
      });
    }
  });
  return res;
}
