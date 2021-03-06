import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {Milliseconds} from '@shared/models/time';

export interface AccountTimeline {
  start: Account;
  currentAccount: Account;
  buildItemTimelines: BuildItemTimeline[];
}

export interface BuildItemTimeline {
  buildItem: BuildItem;
  transitions: TransitionnedAccount[];
}

export interface TransitionnedAccount {
  transition?: Transition;
  transitionnedAccount: Account;
}

export type TransitionType = 'wait' | 'build';

interface TransitionBase {
  id: number;
  type: TransitionType;
}

export interface WaitTransition extends TransitionBase {
  type: 'wait';
  duration: Milliseconds;
  reason: string;
  events: string[];
}

export interface BuildTransition extends TransitionBase {
  type: 'build';
  buildItem: BuildItem;
}

export type Transition = WaitTransition | BuildTransition;
