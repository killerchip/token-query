import { queryCache } from 'react-query';
import { useState, useEffect } from 'react';
import isEqual from 'lodash/isEqual';

export interface Config<Token, LoginParams> {
  queryKey: string;
  tokenExpired: (token: Token) => boolean;
  refreshExpired: (token: Token) => boolean;
  sendLogin: (loginParams: LoginParams) => Promise<Token>;
  sendRefresh: (token: Token) => Promise<Token>;
  retry: (failCount: number, error: any) => boolean;
}

function createTokenQuery<Token, LoginParams>({
  queryKey,
  tokenExpired,
  refreshExpired,
  sendLogin,
  sendRefresh,
  retry
}: Config<Token, LoginParams>) {
  const getTokenFromStorate = () => {
    const storedToken = localStorage.getItem(queryKey);

    if (!storedToken) {
      return undefined;
    }

    let token: Token | undefined;

    try {
      token = JSON.parse(storedToken);
      // eslint-disable-next-line no-empty
    } catch {}

    return token;
  };

  const setTokenValue = (token: Token | undefined) => {
    if (token === undefined) {
      localStorage.removeItem(queryKey);
    } else {
      localStorage.setItem(queryKey, JSON.stringify(token));
    }

    queryCache.setQueryData(queryKey, token);
  };

  const login = async (loginParams: LoginParams, updateQuery = true) => {
    const token = await queryCache.prefetchQuery({
      queryKey: [`Temp${queryKey}`],
      variables: [loginParams],
      queryFn: (key: string, params: LoginParams) => sendLogin(params),
      config: {
        retry,
        throwOnError: true
      }
    });

    if (updateQuery) {
      setTokenValue(token);
    }

    queryCache.removeQueries(`Temp${queryKey}`);

    return token;
  };

  const logout = async () => {
    setTokenValue(undefined);
  };

  const useLogin = () => {
    const [data, setData] = useState<Token | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<any | null>(null);

    const requestLogin = async (loginParams: LoginParams) => {
      setIsFetching(true);
      setData(null);
      setError(null);

      try {
        const token = await login(loginParams, false);

        setIsFetching(false);
        setData(token);
        setTokenValue(token);

        return token;
      } catch (loginError) {
        setIsFetching(false);
        setError(loginError);
      }

      return undefined;
    };

    return { data, isFetching, error, requestLogin };
  };

  const useToken = () => {
    const existingToken = queryCache.getQueryData(queryKey) as Token;
    const [token, setToken] = useState<Token | undefined>(existingToken);

    useEffect(() => {
      const unsubscribe = queryCache.subscribe((newQueryCache) => {
        const newToken = newQueryCache.getQueryData([queryKey]) as
          | Token
          | undefined;

        if (!isEqual(token, newToken)) {
          setToken(newToken);
        }
      });

      return () => {
        unsubscribe();
      };
    });

    return token;
  };

  const refresh = async (throwOnError = false) => {
    const token = queryCache.getQueryData(queryKey) as Token;
    const newToken = await queryCache.prefetchQuery({
      queryKey: [`temp-refresh-${queryKey}`],
      variables: [token],
      queryFn: (key: string, data: Token) => sendRefresh(data),
      config: {
        retry,
        throwOnError
      }
    });

    setTokenValue(newToken);
  };

  const init = () => {
    const token = getTokenFromStorate();

    if (!token || refreshExpired(token)) {
      setTokenValue(undefined);
    }

    // TODO refresh token if expired

    // TODO start background refreshing

    setTokenValue(token);
  };

  return { init, useLogin, useToken, logout, refresh };
}

export default createTokenQuery;
