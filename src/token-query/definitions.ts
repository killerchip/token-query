import { generateToken } from './helpers';

export const DELAY = 1000 * 3;
export const GRACE_PERIOD = 1000 * 60 * 1;

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

export const refreshExpiredError = () => new Error('401-Refresh expired');

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

const isInPast = (timestamp: number) => {
  const now = new Date().getTime();

  return now > timestamp;
};

export const tokenExpired = (token: Token): boolean => isInPast(token.token);

export const refreshTokenExpired = (token: Token): boolean =>
  isInPast(token.refresh);

export const shouldRefreshOnBackground = (token: Token) =>
  isInPast(token.token - GRACE_PERIOD);
