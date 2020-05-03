import {injectUI} from '@src/controllers/inject';
import {parseUI} from '@src/controllers/parse';
import {resetUI} from '@src/controllers/reset';
import {initStorage} from '@src/controllers/storage';

async function run(): Promise<void> {
  if (document.location.hostname !== 'lobby.ogame.gameforge.com') {
    resetUI();
    await initStorage();
    parseUI();
    injectUI();
  }
}

// eslint-disable-next-line no-console
run().catch(console.error);
