import {getItem, setItem} from '@src/controllers/networkstorage';
import {Account} from '@src/models/account';
import {SESSION_ID, SESSION_ID_LOCAL_STORAGE_KEY} from '@src/models/constants';
import {setAccount} from '@src/stores/account';

const ACCOUNT_LOCAL_STORAGE_KEY = 'titanraccoon';

export async function initStorage(): Promise<void> {
  const raw = await getItem(ACCOUNT_LOCAL_STORAGE_KEY);
  // eslint-disable-next-line no-null/no-null
  if (raw !== null) {
    const account = JSON.parse(raw) as Account;
    setAccount(account, false);
  }
}

export async function persist(account: Account): Promise<void> {
  const sessionId = await getItem(SESSION_ID_LOCAL_STORAGE_KEY);
  // eslint-disable-next-line no-null/no-null
  if (sessionId === null || sessionId !== SESSION_ID) {
    throw new Error('Invalid session! Multiple tabs may be open...');
  }
  await setItem(ACCOUNT_LOCAL_STORAGE_KEY, JSON.stringify(account));
}
