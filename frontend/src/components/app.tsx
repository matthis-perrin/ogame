import React, {FC} from 'react';

import {createNewAccount} from '@shared/lib/account';
import {Rosalind} from '@shared/models/universe';

export const App: FC = () => <div>Hello</div>;
App.displayName = 'App';

console.log(createNewAccount(Rosalind));
