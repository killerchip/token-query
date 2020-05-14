import createTokenQuery from '../token-query/tokenQuery';

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

const sendLogin = async (data: LoginParams) => {
  const TOKEN_LIFE = 1000 * 60 * 2;
  const REFRESH_LIFE = 1000 * 60 * 3;
  const now = new Date().getTime();

  return new Promise<Token>((resolve) =>
    setTimeout(() => {
      resolve({
        token: now + TOKEN_LIFE,
        refresh: now + REFRESH_LIFE,
        holder: data.email
      });
    }, 2000)
  );
};

const sendRefresh = async (data: Token) => {
  const TOKEN_LIFE = 1000 * 60 * 2;
  const REFRESH_LIFE = 1000 * 60 * 3;
  const now = new Date().getTime();

  return new Promise<Token>((resolve) =>
    setTimeout(() => {
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

const mockTokenQuery = createTokenQuery<Token, LoginParams>({
  queryKey: 'token',
  tokenExpired,
  refreshExpired,
  sendLogin,
  sendRefresh,
  retry,
  tokenExpiredError: new Error('401-Refresh token expired'),
  shouldTriggerFetch: (token) => {
    const REFRESH_TIME_BEFORE_EXPIRE = 1000 * 60 * 1;

    const now = new Date().getTime();
    return now > token.token - REFRESH_TIME_BEFORE_EXPIRE;
  }
});

mockTokenQuery.init(1000 * 30);

/* eslint-disable prefer-destructuring */
export const useToken = mockTokenQuery.useToken;
export const useLogin = mockTokenQuery.useLogin;
export const logout = mockTokenQuery.logout;
export const refresh = mockTokenQuery.refresh;
export const getToken = mockTokenQuery.getToken;

export default mockTokenQuery;
