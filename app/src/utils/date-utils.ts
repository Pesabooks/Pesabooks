import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const formatTimestampSeconds = (seconds: number | undefined | null) => {
  if (!seconds) return '';
  return dayjs.unix(seconds).format('LLL');
};

export const formatDate = (date: string | number | Date | undefined) => {
  if (!date) return '';
  return dayjs(date).format('LLL');
};

export const formatDated = (date: string) => {
  if (!date) return '';
  return dayjs(date).format('MMM-YYYY');
};
