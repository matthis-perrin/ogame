/* eslint-disable no-null/no-null */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import $ from 'jquery';

import {runScript} from '@src/controllers/function';

const resourcesRegex = /metal=(\d+)&crystal=(\d+)&deuterium=(\d+)/;
export function handleResourcesToSend(): void {
  if (document.location.search.includes('component=fleetdispatch')) {
    $('input[name=transporterLarge]').focus();
    const match = resourcesRegex.exec(document.location.search);
    if (match !== null) {
      const observer = new MutationObserver(mutations =>
        mutations.forEach(() => {
          const ressourceInputs = document.querySelector('#sendfleet #resources');
          if (ressourceInputs === null) {
            return;
          }
          const metalInput = ressourceInputs.querySelector('input[name="metal"]');
          const crystalInput = ressourceInputs.querySelector('input[name="crystal"]');
          const deuteriumInput = ressourceInputs.querySelector('input[name="deuterium"]');
          let scriptStr = '';
          if (metalInput !== null) {
            scriptStr += `fleetDispatcher.cargoMetal = ${match[1]};formatNumber($('#metal'), ${match[1]});`;
          }
          if (crystalInput !== null) {
            scriptStr += `fleetDispatcher.cargoCrystal = ${match[2]};formatNumber($('#crystal'), ${match[2]});`;
          }
          if (deuteriumInput !== null) {
            scriptStr += `fleetDispatcher.cargoDeuterium = ${match[3]};formatNumber($('#deuterium'), ${match[3]});`;
          }
          runScript(scriptStr);
        })
      );
      const target = document.getElementById('fleet3');
      if (target !== null) {
        observer.observe(target, {attributes: true, attributeFilter: ['style']});
      }
    }
  }
}

export function resetUI(): void {
  $('body').css({background: 'black', display: 'flex'});
  $('body > #chatbarcomponent > #chatBar').css({bottom: '0px'});
  $('#pageContent,body > .contentBoxBody').css({marginLeft: '0px', top: '0px'});
  $('html > body #planetList > div > a').each((_, element) => {
    $(element).bind('mouseenter', e => e.stopPropagation());
  });
  $('#planetbarcomponent #rechts #myPlanets .smallplanet').css('height', '69px');
  $('#siteHeader,#mmonetbar,#banner_skyscraper,#siteFooter').css({display: 'none'});
  handleResourcesToSend();
}
