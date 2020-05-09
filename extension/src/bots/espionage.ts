/* eslint-disable no-null/no-null */
import $ from 'jquery';

import {Coordinates} from '@shared/models/coordinates';
import {EspionageProbe} from '@shared/models/ships';
import {Rosalind} from '@shared/models/universe';

import {sendProbes} from '@src/controllers/function';
import {Account} from '@src/models/account';
import {PROBES_AMOUNT} from '@src/models/constants';
import {findPlanetCoords, getCoords, PlanetCoords} from '@src/models/planets';
import {getAccount, setAccount} from '@src/stores/account';

const BOT_LOOP_TIME = 2000;
let interval: number | undefined;

export interface BotProbes {
  start: PlanetCoords;
  current: PlanetCoords;
  sent: string[];
}

function transformCoords(coords: Coordinates): PlanetCoords {
  return `[${coords.galaxy}:${coords.solarSystem}:${coords.position}]` as PlanetCoords;
}

function saveAccount(account: Account, botProbes: BotProbes | undefined): void {
  account.bots.espionage = botProbes;
  setAccount(account);
}

const probesRegex = /^Sonde:[^\d]+(\d+)$/;
const slotsRegex = /^Slots utilisés:[^\d]+(\d+)\/(\d+)$/;

function loop(): void {
  const account = getAccount();
  if (account === undefined || account.bots.espionage === undefined) {
    return;
  }

  const botProbes = account.bots.espionage;

  if (!document.location.search.includes('component=galaxy')) {
    return;
  }

  if ($('#galaxyLoading').is(':visible')) {
    return;
  }

  const coords = getCoords(botProbes.current);

  const galaxyHeader = $('#galaxyHeader');
  if (galaxyHeader.length === 0) {
    return;
  }

  const solarSystemInput = galaxyHeader.find('#system_input');
  if (solarSystemInput.length === 0) {
    return;
  }

  const refreshButton = galaxyHeader.find('.btn_blue:eq(0)');
  if (refreshButton.length === 0 || refreshButton.text() !== 'C`est parti !') {
    return;
  }

  if (solarSystemInput.val() !== coords.solarSystem.toString()) {
    solarSystemInput.val(coords.solarSystem.toString());
    refreshButton.click();
    return;
  }

  const galaxyTable = $('#galaxytable');
  if (galaxyTable.length === 0) {
    return;
  }

  const topBar = galaxyTable.find('tr.info');
  if (topBar.length === 0) {
    return;
  }

  const probesMatch = probesRegex.exec(
    topBar
      .find('#probes')
      .text()
      .trim()
  );
  if (probesMatch === null) {
    return;
  }
  const slotsMatch = slotsRegex.exec(
    topBar
      .find('#slots')
      .text()
      .trim()
  );
  if (slotsMatch === null) {
    return;
  }

  const probesAmount = parseFloat(probesMatch[1]);
  const slotsUsed = parseFloat(slotsMatch[1]);
  const slotsTotal = parseFloat(slotsMatch[2]);

  if (probesAmount < PROBES_AMOUNT || slotsUsed >= slotsTotal) {
    refreshButton.click();
    return;
  }

  let shouldStop = false;

  galaxyTable.find('tbody > tr').each((index, element) => {
    if (shouldStop) {
      return;
    }

    const newCoords = transformCoords({
      galaxy: coords.galaxy,
      solarSystem: coords.solarSystem,
      position: index + 1,
    });

    if (account.bots.colonies) {
      if (
        element.classList.length === 2 &&
        element.classList[0] === 'row' &&
        element.classList[1] === 'empty_filter'
      ) {
        account.emptyPlanets[newCoords] = true;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete account.emptyPlanets[newCoords];
      }
    }

    if (
      element.classList.length !== 2 ||
      element.classList[0] !== 'row' ||
      element.classList[1] !== 'inactive_filter'
    ) {
      return;
    }

    if (botProbes.sent.includes(newCoords)) {
      return;
    }

    botProbes.sent.push(newCoords);
    saveAccount(account, botProbes);

    shouldStop = true;
    sendProbes(newCoords);
    setTimeout(() => refreshButton.click(), BOT_LOOP_TIME / 2);
  });

  if (shouldStop) {
    return;
  }

  const nextCoords = transformCoords({
    galaxy: coords.galaxy,
    solarSystem: (coords.solarSystem % Rosalind.numberOfSystem) + 1,
    position: coords.position,
  });

  if (nextCoords === botProbes.start) {
    saveAccount(account, undefined);
  } else {
    botProbes.current = nextCoords;
    saveAccount(account, botProbes);
  }
}

export function startEspionageBot(): void {
  if (interval !== undefined) {
    return;
  }
  interval = setInterval(loop, BOT_LOOP_TIME);
}

export function initEspionageBot(): void {
  const account = getAccount();
  if (account === undefined || account.bots.espionage !== undefined) {
    return;
  }

  const planetDetail = account.planetDetails[account.currentPlanetId];
  if (!planetDetail.ships.hasOwnProperty(EspionageProbe.id)) {
    return;
  }

  const probesAmount = planetDetail.ships[EspionageProbe.id].value;
  if (probesAmount <= 0) {
    return;
  }

  const planetCoords = findPlanetCoords(account.planetList, account.currentPlanetId);
  saveAccount(account, {start: planetCoords, current: planetCoords, sent: []});
}

export function stopEspionageBot(): void {
  const account = getAccount();
  if (account === undefined || account.bots.espionage === undefined) {
    return;
  }

  saveAccount(account, undefined);
}
