import {useEffect, useState} from 'react';

import {persist} from '@src/controllers/storage';
import {Account} from '@src/models/account';

let currentAccount: Account | undefined;
const accountListeners: ((account: Account) => void)[] = [];

export function setAccount(account: Account, persistent = true): void {
  currentAccount = account;
  if (persistent) {
    persist(account);
  }
  for (const listener of accountListeners) {
    listener(currentAccount);
  }
}

export function getAccount(): Account | undefined {
  return currentAccount;
}

export function useAccount(): [Account | undefined] {
  const [account, setInternalAccount] = useState(currentAccount);
  useEffect(() => {
    if (account !== currentAccount) {
      setInternalAccount(currentAccount);
    }
    accountListeners.push(setInternalAccount);
    return () => {
      accountListeners.splice(accountListeners.indexOf(setInternalAccount), 1);
    };
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  return [account];
}
