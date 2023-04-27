interface Schema {
  supabase_access_token: string;
  user_id: string;
  redirect_url: string;
  emailForSignIn: string;
}

export const setTypedStorageItem = <T extends keyof Schema>(key: T, value: Schema[T]): void => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getTypedStorageItem = <T extends keyof Schema>(key: T): Schema[T] | null => {
  const data = window.localStorage.getItem(key);
  if (!data) return null;
  return JSON.parse(data) as Schema[T];
};

export const clearTypedStorageItem = <T extends keyof Schema>(key: T): void => {
  window.localStorage.removeItem(key);
};
