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

export class ErrorType extends Error {}

export type SendRefreshFn = (key: string, token: Token) => Promise<Token>;

export const sendLogin: SendLoginFn = (_, data) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateToken(data.email));
    }, DELAY);
  });

export const onLogout = async () => {};

export const sendRefresh: SendRefreshFn = (_, token) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateToken(token.holder));
    }, DELAY);
  });

export const isPermanentError = (error: ErrorType): boolean =>
  error.message.includes('401-');

export const shouldRetry = (failureCount: number, error: unknown): boolean => {
  return failureCount < 3 && !isPermanentError(error as ErrorType);
};

export const onPermanentRefreshError = async (
  _: ErrorType,
  logout: () => void
) => {
  logout();
};
