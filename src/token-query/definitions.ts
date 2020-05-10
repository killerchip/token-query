import { generateToken } from './helpers';

export const DELAY = 1000 * 3;

export const QUERY_KEY = 'token';

export interface Token {
  token: number;
  refresh: number;
  holder: string;
}

export interface LoginRequestData {
  email: string;
}

export type SendLoginFn = (
  key: string,
  data: LoginRequestData
) => Promise<Token>;

export const sendLogin: SendLoginFn = (_, data) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateToken(data.email));
    }, DELAY);
  });
