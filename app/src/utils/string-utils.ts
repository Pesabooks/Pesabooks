export const shortenString = (str: string, length: number): string => {
  if (!str) return '';

  return str.substring(0, length) + '...';
};
