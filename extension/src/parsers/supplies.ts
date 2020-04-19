import $ from 'jquery';

import {TechId} from '@src/models/resources';
import {Technology, TechnologyValue} from '@src/models/technologies';

export function parseSupplies(): Technology[] {
  const res: Technology[] = [];
  $('html > body > #pageContent > #middle #producers > li').each((_, element) => {
    const technology = element.getAttribute('data-technology');
    // eslint-disable-next-line no-null/no-null
    if (technology !== null) {
      let value = $(element)
        .find('span.level[data-value]')
        .attr('data-value');
      if (value === undefined) {
        value = $(element)
          .find('span.amount[data-value]')
          .attr('data-value');
      }
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
