import $ from 'jquery';

import {TechId} from '@src/models/resources';
import {Technology, TechnologyValue} from '@src/models/technologies';

export function parseFleet(): Technology[] {
  const res: Technology[] = [];
  $('html > body > #pageContent > #middle #technologies li').each((_, element) => {
    const technology = element.getAttribute('data-technology');
    // eslint-disable-next-line no-null/no-null
    if (technology !== null) {
      const value = $(element)
        .find('span.amount[data-value]')
        .attr('data-value');
      if (value !== undefined) {
        res.push({
          techId: parseFloat(technology) as TechId,
          value: parseFloat(value) as TechnologyValue,
        });
      }
    }
  });
  return res;
}
