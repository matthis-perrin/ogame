import React from 'react';
import ReactDOM from 'react-dom';

// import {test} from '@shared/algogen/local_optim';
import {setupRapidFire, setupRequirements} from '@shared/models/dependencies';
import {AstrophysicsTechnology} from '@shared/models/technology';

import {App} from '@src/lib/app';
import {setAppState} from '@src/lib/store';
import {naiveAccountTimeline} from '@src/run_algogen';

// import {run} from '@src/run_algogen';

setupRapidFire();
setupRequirements();

const accountTimeline = naiveAccountTimeline({
  type: 'technology',
  buildable: AstrophysicsTechnology,
  level: 13,
});

setAppState({accountTimeline, selectedAccount: accountTimeline.start});

ReactDOM.render(<App></App>, document.getElementById('app'));

// test();
// run();
