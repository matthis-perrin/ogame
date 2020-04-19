import $ from 'jquery';

import {TechId} from '@src/models/resources';
import {Technology, TechnologyValue} from '@src/models/technologies';

export function parseTechnologies(): Technology[] {
  const res: Technology[] = [];
  $('html > body #pageContent #technologies li').each((_, element) => {
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
        let target = $(element)
          .find('.targetlevel[data-value]')
          .attr('data-value');
        if (target === undefined) {
          target = $(element)
            .find('.targetamount[data-value]')
            .attr('data-value');
        }
        const targetEndSeconds = $(element)
          .find('.countdown[data-end]')
          .attr('data-end');
        res.push({
          techId: parseFloat(technology) as TechId,
          value: parseFloat(value) as TechnologyValue,
          target: target !== undefined ? (parseFloat(target) as TechnologyValue) : undefined,
          targetEndSeconds:
            targetEndSeconds !== undefined ? parseFloat(targetEndSeconds) : undefined,
        });
      }
    }
  });
  return res;
}
