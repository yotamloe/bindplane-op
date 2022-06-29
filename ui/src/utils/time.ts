import { formatDistance } from 'date-fns';

export function timeAgoInWords(date: Date, from: Date = new Date()): string {
  return formatDistance(date, from);
}
