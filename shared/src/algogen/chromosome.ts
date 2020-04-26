import {BuildItem} from '@shared/models/build_item';
import {AccountTimeline} from '@shared/models/timeline';

export interface Chromosome {
  buildOrder: BuildItem[];
  accountTimeline: AccountTimeline;
}
