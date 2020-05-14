import createTokenQuery from '../token-query/tokenQuery';

interface Token {
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
  retry
});

mockTokenQuery.init();

/* eslint-disable prefer-destructuring */
export const useToken = mockTokenQuery.useToken;
export const useLogin = mockTokenQuery.useLogin;
export const logout = mockTokenQuery.logout;
export const refresh = mockTokenQuery.refresh;

export default mockTokenQuery;
