import {injectUI} from '@src/controllers/inject';
import {parseUI} from '@src/controllers/parse';
import {resetUI} from '@src/controllers/reset';
import {initStorage} from '@src/controllers/storage';

if (document.location.hostname !== 'lobby.ogame.gameforge.com') {
  resetUI();
  initStorage();
  parseUI();
  injectUI();
}
