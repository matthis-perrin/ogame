import $ from 'jquery';

import {PlanetName} from '@src/models/planets';
import {TechId} from '@src/models/resources';
import {Technology, TechnologyValue} from '@src/models/technologies';

const planetNameRegex = /planète (.*) \[/;

export function parseTechnologies(): Technology[] {
  const res: Technology[] = [];
  let constructionPlanetName: PlanetName | undefined;
  if (document.location.search.includes('component=research')) {
    $('html > body #productionboxresearchcomponent a.tooltip.abortNow[title]').each(
      (_, element) => {
        const title = element.getAttribute('title');
        // eslint-disable-next-line no-null/no-null
        if (title === null) {
          return;
        }
        const match = planetNameRegex.exec(title);
        // eslint-disable-next-line no-null/no-null
        if (match !== null) {
          constructionPlanetName = match[1] as PlanetName;
        }
      }
    );
  }
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
          constructionPlanetName: target !== undefined ? constructionPlanetName : undefined,
        });
      }
    }
  });
  return res;
}
