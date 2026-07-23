import { isNil } from '../utils';

export function validateEventsArray(events?: any[]) {
  if (isNil(events) || !events || events.length === 0) {
    return ['child_added', 'child_removed', 'child_changed', 'child_moved'];
  }
  return events;
}
