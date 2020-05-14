import { queryCache } from 'react-query';
import { useState, useEffect } from 'react';
import isEqual from 'lodash/isEqual';

export interface Config<TToken, LoginParams> {
  tokenExpired: (token: TToken) => boolean;
  refreshExpired: (token: TToken) => boolean;
  sendLogin: (loginParams: LoginParams) => Promise<TToken>;
  sendRefresh: (token: TToken) => Promise<TToken>;
  retry: (failCount: number, error: any) => boolean;
  tokenExpiredError: any;
  queryKey?: string;
  shouldTriggerFetch?: (token: TToken) => boolean;
}

function createTokenQuery<TToken, LoginParams>({
  queryKey = 'token',
  tokenExpired,
  refreshExpired,
  sendLogin,
  sendRefresh,
  retry,
  tokenExpiredError,
  shouldTriggerFetch
}: Config<TToken, LoginParams>) {
  const getTokenFromStorate = () => {
    const storedToken = localStorage.getItem(queryKey);

    if (!storedToken) {
      return undefined;
    }

    let token: TToken | undefined;

    try {
      token = JSON.parse(storedToken);
      // eslint-disable-next-line no-empty
    } catch {}

    return token;
  };

  const setTokenValue = (token: TToken | undefined) => {
    if (token === undefined) {
      localStorage.removeItem(queryKey);
    } else {
      localStorage.setItem(queryKey, JSON.stringify(token));
    }

    queryCache.setQueryData(queryKey, token);
  };

  const login = async (loginParams: LoginParams, updateQuery = true) => {
    const token = await queryCache.prefetchQuery({
      queryKey: [`temp-login-${queryKey}`],
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

    queryCache.removeQueries(`temp-login-${queryKey}`);

    return token;
  };

  const logout = async () => {
    setTokenValue(undefined);
  };

  const useLogin = () => {
    const [data, setData] = useState<TToken | null>(null);
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
    const existingToken = queryCache.getQueryData(queryKey) as TToken;
    const [token, setToken] = useState<TToken | undefined>(existingToken);

    useEffect(() => {
      const unsubscribe = queryCache.subscribe((newQueryCache) => {
        const newToken = newQueryCache.getQueryData([queryKey]) as
          | TToken
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
    const token = queryCache.getQueryData(queryKey) as TToken;
    const newToken = await queryCache.prefetchQuery({
      queryKey: [`temp-refresh-${queryKey}`],
      variables: [token],
      queryFn: (key: string, data: TToken) => sendRefresh(data),
      config: {
        retry,
        throwOnError
      }
    });

    setTokenValue(newToken);
    queryCache.removeQueries(`temp-refresh-${queryKey}`);

    return newToken;
  };

  const getToken = async (force = false) => {
    const token = queryCache.getQueryData(queryKey) as TToken | undefined;

    if (token === undefined) return undefined;

    if (refreshExpired(token)) {
      throw tokenExpiredError;
    }

    if (tokenExpired(token) || force) {
      const newToken = await refresh(true);

      return newToken;
    }

    if (shouldTriggerFetch && shouldTriggerFetch(token)) {
      refresh();
    }

    return token;
  };

  const init = async (refreshInterval?: number) => {
    const token = getTokenFromStorate();

    if (!token || refreshExpired(token)) {
      setTokenValue(undefined);

      return;
    }

    setTokenValue(token);

    if (refreshInterval) {
      // START refresh interval
    }
  };

  return { init, useLogin, useToken, logout, refresh, getToken };
}

export default createTokenQuery;
