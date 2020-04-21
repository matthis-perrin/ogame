import {Account} from '@src/models/account';
import {SESSION_ID, SESSION_ID_LOCAL_STORAGE_KEY} from '@src/models/constants';
import {setAccount} from '@src/stores/store_account';

const ACCOUNT_LOCAL_STORAGE_KEY = 'titanraccoon';

export function initStorage(): void {
  try {
    const raw = localStorage.getItem(ACCOUNT_LOCAL_STORAGE_KEY);
    // eslint-disable-next-line no-null/no-null
    if (raw !== null) {
      const account = JSON.parse(raw) as Account;
      setAccount(account, false);
    }
    // eslint-disable-next-line no-empty
  } catch {}
}

export function persist(account: Account): void {
  const sessionId = localStorage.getItem(SESSION_ID_LOCAL_STORAGE_KEY);
  // eslint-disable-next-line no-null/no-null
  if (sessionId === null || sessionId !== SESSION_ID) {
    // eslint-disable-next-line no-console
    console.error('Invalid session! Multiple tabs may be open...');
    return;
  }
  localStorage.setItem(ACCOUNT_LOCAL_STORAGE_KEY, JSON.stringify(account));
}
