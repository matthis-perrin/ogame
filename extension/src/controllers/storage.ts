import {Account} from '@src/models/account';
import {setAccount} from '@src/stores/account';

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
  localStorage.setItem(ACCOUNT_LOCAL_STORAGE_KEY, JSON.stringify(account));
}
