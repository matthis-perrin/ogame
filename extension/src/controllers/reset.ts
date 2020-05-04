/* eslint-disable no-null/no-null */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import $ from 'jquery';

import {runScript} from '@src/controllers/function';

const resourcesRegex = /metal=(\d+)&crystal=(\d+)&deuterium=(\d+)/;
function handleResourcesToSend(): void {
  if (document.location.search.includes('component=fleetdispatch')) {
    $('input[name=transporterLarge]').focus();
    const resourcesMatch = resourcesRegex.exec(document.location.search);
    const allResources = document.location.search.includes('resources=all');
    if (resourcesMatch !== null || allResources) {
      const resourcesTarget = document.getElementById('fleet3');
      if (resourcesTarget !== null) {
        new MutationObserver(mutations =>
          mutations.forEach(() => {
            const ressourceInputs = document.querySelector('#sendfleet #resources');
            if (ressourceInputs === null) {
              return;
            }
            let scriptStr = '';
            if (allResources) {
              scriptStr = 'fleetDispatcher.selectMaxAll();fleetDispatcher.refresh();';
            } else if (resourcesMatch !== null) {
              const metalInput = ressourceInputs.querySelector('input[name="metal"]');
              const crystalInput = ressourceInputs.querySelector('input[name="crystal"]');
              const deuteriumInput = ressourceInputs.querySelector('input[name="deuterium"]');

              if (metalInput !== null) {
                scriptStr += `fleetDispatcher.cargoMetal = ${resourcesMatch[1]};formatNumber($('#metal'),${resourcesMatch[1]});`;
              }
              if (crystalInput !== null) {
                scriptStr += `fleetDispatcher.cargoCrystal = ${resourcesMatch[2]};formatNumber($('#crystal'),${resourcesMatch[2]});`;
              }
              if (deuteriumInput !== null) {
                scriptStr += `fleetDispatcher.cargoDeuterium = ${resourcesMatch[3]};formatNumber($('#deuterium'),${resourcesMatch[3]});`;
              }
            }
            if (scriptStr.length > 0) {
              runScript(scriptStr);
              if (document.location.search.includes('auto=true')) {
                if (!$('#fleet3').is(':visible')) {
                  return;
                }
                runScript(
                  'fleetDispatcher.updateCargo();fleetDispatcher.refreshCargo();fleetDispatcher.trySubmitFleet3();'
                );
              }
            }
          })
        ).observe(resourcesTarget, {attributes: true, attributeFilter: ['style']});
      }
    }
  }
}

const speedRegex = /speed=(\d+)/;
function handleSpeedToSend(): void {
  if (document.location.search.includes('component=fleetdispatch')) {
    const speedMatch = speedRegex.exec(document.location.search);
    if (speedMatch !== null) {
      const resourcesTarget = document.getElementById('fleet2');
      if (resourcesTarget !== null) {
        new MutationObserver(mutations =>
          mutations.forEach(() => {
            runScript(
              `fleetDispatcher.setFleetPercent(${speedMatch[1]});fleetDispatcher.refresh();`
            );
            if (document.location.search.includes('auto=true')) {
              if (!$('#fleet2').is(':visible')) {
                return;
              }
              runScript('fleetDispatcher.trySubmitFleet2();');
            }
          })
        ).observe(resourcesTarget, {attributes: true, attributeFilter: ['style']});
      }
    }
  }
}

function handleShips(): void {
  if (document.location.search.includes('component=fleetdispatch')) {
    const shipsTarget = document.getElementById('fleet1');
    if (shipsTarget !== null) {
      if (document.location.search.includes('auto=true')) {
        const inputVal = $('input[name="transporterLarge"]').val();
        if (!$('#fleet1').is(':visible') || inputVal === undefined || inputVal === '') {
          return;
        }
        runScript('fleetDispatcher.trySubmitFleet1();');
      }
    }
  }
}

export function resetUI(): void {
  $('body').css({background: '#111', display: 'flex'});
  $('body > #chatbarcomponent > #chatBar').css({bottom: '0px'});
  $('#pageContent,body > .contentBoxBody').css({marginLeft: '0px', top: '0px'});
  $('html > body #planetList > div > a').each((_, element) => {
    $(element).bind('mouseenter', e => e.stopPropagation());
  });
  $('#planetbarcomponent #rechts #myPlanets .smallplanet').css('height', '69px');
  $('#siteHeader,#mmonetbar,#banner_skyscraper,#siteFooter').css({display: 'none'});
  handleResourcesToSend();
  handleSpeedToSend();
  handleShips();
}
