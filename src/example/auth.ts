import createTokenQuery from '../token-query/tokenQuery';
import { responses } from './errorSimulator';

export interface Token {
  token: number;
  refresh: number;
  holder: string;
}

interface LoginParams {
  email: string;
}

const tokenExpired = (token: Token) => {
  const now = new Date().getTime();

  return token.token < now;
};

const refreshExpired = (token: Token) => {
  const now = new Date().getTime();

  return token.refresh < now;
};

// simulating sending a login request
// and the response
const sendLogin = async (data: LoginParams) => {
  const TOKEN_LIFE = 1000 * 60 * 2;
  const REFRESH_LIFE = 1000 * 60 * 3;
  const now = new Date().getTime();

  return new Promise<Token>((resolve, reject) =>
    setTimeout(() => {
      if (responses.loginResponse === 'permanent') {
        reject(new Error('401-Unauthorized'));
        return;
      }

      if (responses.loginResponse === 'temporary') {
        reject(new Error('Network error'));
        return;
      }

      resolve({
        token: now + TOKEN_LIFE,
        refresh: now + REFRESH_LIFE,
        holder: data.email
      });
    }, 2000)
  );
};

// simulating sending a refresh-token request
// and the response with the new token
const sendRefresh = async (data: Token) => {
  const TOKEN_LIFE = 1000 * 60 * 2;
  const REFRESH_LIFE = 1000 * 60 * 3;
  const now = new Date().getTime();

  return new Promise<Token>((resolve, reject) =>
    setTimeout(() => {
      if (responses.refreshResponse === 'permanent') {
        reject(new Error('401-Unauthorized'));
        return;
      }

      if (responses.refreshResponse === 'temporary') {
        reject(new Error('Network error'));
        return;
      }

      resolve({
        token: now + TOKEN_LIFE,
        refresh: now + REFRESH_LIFE,
        holder: data.holder
      });
    }, 2000)
  );
};

const retry = (count: number, error: Error) =>
  count < 3 && !error.message.includes('401-');

const shouldRefreshOnBackground = (token: Token) => {
  const REFRESH_TIME_BEFORE_EXPIRE = 1000 * 60 * 1;

  const now = new Date().getTime();
  return now > token.token - REFRESH_TIME_BEFORE_EXPIRE;
};

const mockTokenQuery = createTokenQuery<Token, LoginParams>({
  queryKey: 'token',
  tokenExpired,
  refreshExpired,
  sendLogin,
  sendRefresh,
  retry,
  tokenExpiredError: new Error('401-Refresh token expired'),
  shouldRefreshOnBackground
});

mockTokenQuery.init(1000 * 60); // 1min

/* eslint-disable prefer-destructuring */
export const useToken = mockTokenQuery.useToken;
export const useLogin = mockTokenQuery.useLogin;
export const logout = mockTokenQuery.logout;
export const refresh = mockTokenQuery.refresh;
export const getToken = mockTokenQuery.getToken;
/* eslint-enable prefer-destructuring */

export default mockTokenQuery;
