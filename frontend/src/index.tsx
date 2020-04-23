import React from 'react';
import ReactDOM from 'react-dom';

import {setupRapidFire, setupRequirements} from '@shared/models/dependencies';

import {App} from '@src/components/app';

setupRapidFire();
setupRequirements();
ReactDOM.render(<App></App>, document.getElementById('app'));
