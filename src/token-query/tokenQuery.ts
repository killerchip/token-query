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
  shouldRefreshOnBackground?: (token: TToken) => boolean;
}

function createTokenQuery<TToken, LoginParams>({
  queryKey = 'token',
  tokenExpired,
  refreshExpired,
  sendLogin,
  sendRefresh,
  retry,
  tokenExpiredError,
  shouldRefreshOnBackground
}: Config<TToken, LoginParams>) {
  let tokenRefreshIntervalHandler: any;
  let tokenRefreshInterval: number;

  const getTokenFromStorage = () => {
    const storedValue = localStorage.getItem(queryKey);

    if (!storedValue) {
      return undefined;
    }

    let token: TToken | undefined;

    try {
      token = JSON.parse(storedValue);
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

  const refresh = async (throwOnError = false) => {
    const token = queryCache.getQueryData(queryKey) as TToken;

    const newToken = await queryCache.prefetchQuery({
      queryKey: [`temp-refresh-${queryKey}`],
      variables: [token],
      queryFn: (_: string, data: TToken) => sendRefresh(data),
      config: {
        retry,
        throwOnError
      }
    });

    // If token is undefined then refresh has failed
    if (newToken !== undefined) {
      setTokenValue(newToken);
    }

    queryCache.removeQueries(`temp-refresh-${queryKey}`);

    return newToken;
  };

  const startBackgroundRefreshing = () => {
    clearInterval(tokenRefreshIntervalHandler);

    tokenRefreshIntervalHandler = setInterval(() => {
      refresh();
    }, tokenRefreshInterval);
  };

  const stopBackgroundRefreshing = () => {
    clearInterval(tokenRefreshIntervalHandler);
  };

  const login = async (loginParams: LoginParams) => {
    const token = await queryCache.prefetchQuery({
      queryKey: [`temp-login-${queryKey}`],
      variables: [loginParams],
      queryFn: (_: string, params: LoginParams) => sendLogin(params),
      config: {
        retry,
        throwOnError: true
      }
    });

    if (tokenRefreshInterval) {
      startBackgroundRefreshing();
    }

    queryCache.removeQueries(`temp-login-${queryKey}`);

    return token;
  };

  const logout = async () => {
    setTokenValue(undefined);
    stopBackgroundRefreshing();
  };

  const useLogin = () => {
    const [data, setData] = useState<TToken | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<any | null>(null);

    const requestLogin = async (
      loginParams: LoginParams,
      throwOnError = false
    ) => {
      setIsFetching(true);
      setData(null);
      setError(null);

      try {
        const token = await login(loginParams);

        setIsFetching(false);
        setData(token);
        setTokenValue(token);

        return token;
      } catch (loginError) {
        setIsFetching(false);
        setError(loginError);

        if (throwOnError) {
          throw loginError;
        }
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

    if (shouldRefreshOnBackground && shouldRefreshOnBackground(token)) {
      refresh();
    }

    return token;
  };

  const init = async (refreshInterval?: number) => {
    if (refreshInterval) {
      tokenRefreshInterval = refreshInterval;
    }

    const token = getTokenFromStorage();

    if (!token || refreshExpired(token)) {
      setTokenValue(undefined);

      return;
    }

    setTokenValue(token);

    if (refreshInterval) {
      startBackgroundRefreshing();
    }
  };

  return { init, useLogin, useToken, logout, refresh, getToken };
}

export default createTokenQuery;
