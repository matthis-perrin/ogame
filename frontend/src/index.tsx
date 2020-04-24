import React from 'react';
import ReactDOM from 'react-dom';

import {createNewAccount} from '@shared/lib/account';
import {setupRapidFire, setupRequirements} from '@shared/models/dependencies';
import {Destroyer} from '@shared/models/ships';
import {Rosalind} from '@shared/models/universe';

import {App} from '@src/components/app';
import {setAppState} from '@src/lib/store';
import {getAccountTimeline} from '@src/lib/timeline';

setupRapidFire();
setupRequirements();

setTimeout(() => {
  const accountTimeline = getAccountTimeline(Destroyer, createNewAccount(Rosalind));
  setAppState({accountTimeline, selectedAccount: accountTimeline.start});
});

ReactDOM.render(<App></App>, document.getElementById('app'));
