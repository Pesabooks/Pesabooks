export interface GetAccessTokenRequest {
  user_id: string;
  id_token: string;
}

export interface GetAccessTokenResponse {
  access_token: string;
}
