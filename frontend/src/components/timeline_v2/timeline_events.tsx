import {getBuildItemBuildTime} from '@shared/lib/build_items';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {Milliseconds} from '@shared/models/time';
import {AccountTimeline} from '@shared/models/timeline';
import {sum} from '@shared/utils/type_utils';

export interface TimelineEvent {
  start: Milliseconds;
  end: Milliseconds;
  buildItem: BuildItem;
}

export function getTimelineEvents(accountTimeline: AccountTimeline): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  let currentAccount: Account = accountTimeline.start;
  accountTimeline.buildItemTimelines.forEach(({transitions}) =>
    transitions.forEach(({transition, transitionnedAccount}) => {
      if (!transition) {
        throw new Error('Trying to render an AccountTimeline generated in perf mode');
      }
      if (transition.type === 'wait') {
        currentAccount = transitionnedAccount;
        return;
      }

      const duration = getBuildItemBuildTime(currentAccount, transition.buildItem);
      const start = currentAccount.currentTime;
      const end = sum(start, duration);
      events.push({start, end, buildItem: transition.buildItem});

      currentAccount = transitionnedAccount;
    })
  );

  return events;
}
