import {useEffect, useState} from 'react';

import {Account} from '@shared/models/account';
import {AccountTimeline} from '@shared/models/timeline';

export interface AppState {
  readonly selectedAccount?: Account;
  readonly accountTimeline?: AccountTimeline;
}

let appState: AppState = {};
const storeListeners: ((appState: AppState) => void)[] = [];

export function setAppState(newAppState: AppState): void {
  appState = newAppState;
  for (const listener of storeListeners) {
    listener(newAppState);
  }
}

export function useAppStore(): AppState {
  const [internalAppState, setInternalAppState] = useState(appState);
  useEffect(() => {
    // In case the rev of the data store changed between the time we did the `useState`
    // and the time of the `useEffect` we need to refresh manually the state.
    if (appState !== internalAppState) {
      setInternalAppState(internalAppState);
    }
    // Register the state setter to be called for any subsequent data store change
    storeListeners.push(setInternalAppState);

    return () => {
      storeListeners.splice(storeListeners.indexOf(setInternalAppState), 1);
    };
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  return internalAppState;
}
