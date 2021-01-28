import { UserManager } from 'oidc-client';

const config = {
  authority: 'https://localhost:5001',
  client_id: 'Pesabooks.WebApp',
  redirect_uri: 'http://localhost:3000/signin-oidc',
  response_type: 'id_token token',
  scope: 'openid profile api',
  post_logout_redirect_uri: 'http://localhost:3000/signout-oidc',
};

const userManager = new UserManager(config);

export const loadUserFromStorage = async () => {
  const user = await userManager.getUser();
  return user;
};

export function signinRedirect() {
  return userManager.signinRedirect();
}

export const signinRedirectCallback = async () => {
  const user = await userManager.signinRedirectCallback();
  userManager.storeUser(user);
  return user;
};

export function signoutRedirect() {
  userManager.clearStaleState();
  userManager.removeUser();
  return userManager.signoutRedirect();
}

export function signoutRedirectCallback() {
  userManager.clearStaleState();
  userManager.removeUser();
  return userManager.signoutRedirectCallback();
}

export default userManager;
