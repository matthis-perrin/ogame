import React from 'react';
import ReactDOM from 'react-dom';

import {createNewAccount} from '@shared/lib/account';
import {setupRapidFire, setupRequirements} from '@shared/models/dependencies';
import {SmallCargo} from '@shared/models/ships';
import {Rosalind} from '@shared/models/universe';

import {App} from '@src/components/app';
import {setAppState} from '@src/lib/store';
import {getAccountTimeline} from '@src/lib/timeline';

setupRapidFire();
setupRequirements();

setTimeout(() => {
  const account = createNewAccount(Rosalind);
  const mainPlanet = Array.from(account.planets.values())[0];
  const accountTimeline = getAccountTimeline(
    {type: 'ship', buildable: SmallCargo, planetId: mainPlanet.id, quantity: 1},
    account
  );
  setAppState({accountTimeline, selectedAccount: accountTimeline.start});
});

ReactDOM.render(<App></App>, document.getElementById('app'));
