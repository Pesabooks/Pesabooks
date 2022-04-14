export * from './addresses';

export const checkError = (e: any): string => {
  let message = '';

  if (typeof e === 'string' || e instanceof String) {
    message = e.toString();
  }

  if (e instanceof Error) {
    message = e.message;
  }

  return message;
};
