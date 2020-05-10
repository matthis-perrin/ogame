import {TimelineEvent} from '@src/components/timeline_v2/timeline_events';

type Track = TimelineEvent[];

class TimelineTracks {
  public readonly tracks: Track[] = [];

  public pushEvent(event: TimelineEvent): void {
    for (const track of this.tracks) {
      const {canBeAdded, shouldSort} = this.canBeAddedToTrack(track, event);
      if (canBeAdded) {
        track.push(event);
        if (shouldSort) {
          this.sortTrackChronologically(track);
        }
        return;
      }
    }
    // Can't be pushed in any track, create a new one
    this.tracks.push([event]);
  }

  private canBeAddedToTrack(
    track: Track,
    event: TimelineEvent
  ): {canBeAdded: boolean; shouldSort: boolean} {
    for (let index = track.length - 1; index >= 0; index--) {
      const element = track[index];
      // Event is after
      if (event.start >= element.end) {
        return {canBeAdded: true, shouldSort: index === track.length - 1};
      }
      // Event is before
      if (event.end <= element.start) {
        continue;
      }
      // Event overlap
      return {canBeAdded: false, shouldSort: false};
    }
    // Event is before all
    return {canBeAdded: true, shouldSort: true};
  }

  private sortTrackChronologically(track: Track): void {
    track.sort((e1, e2) => e1.start - e2.start);
  }
}

export function getTimelineTracks(timelineEvents: TimelineEvent[]): Track[] {
  const timelineTracks = new TimelineTracks();
  for (const event of timelineEvents) {
    timelineTracks.pushEvent(event);
  }
  return timelineTracks.tracks;
}
