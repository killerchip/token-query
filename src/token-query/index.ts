import { useState, useEffect } from 'react';
import { queryCache } from 'react-query';
import isEqual from 'lodash/isEqual';

import {
  LoginRequestData,
  QUERY_KEY,
  sendLogin,
  onLogout,
  Token,
  sendRefresh,
  shouldRetry as retry,
  ErrorType,
  tokenExpired,
  shouldRefreshOnBackground,
  refreshTokenExpired,
  refreshExpiredError
} from './definitions';

const saveTokenToLocalStorage = (token: Token) => {
  localStorage.setItem(QUERY_KEY, JSON.stringify(token));
};

const getTokenFromLocalStorage = () => {
  const storedValue = localStorage.getItem(QUERY_KEY);

  if (storedValue) {
    try {
      const token = JSON.parse(storedValue) as Token;

      return token;
    } catch {
      // eslint-disable-next-line no-console
      console.log('Error parsing stored token');

      return undefined;
    }
  } else {
    return undefined;
  }
};

export const useToken = () => {
  const existingToken = queryCache.getQueryData(QUERY_KEY) as Token;
  const [token, setToken] = useState<Token | undefined>(existingToken);

  useEffect(() => {
    const unsubscribe = queryCache.subscribe((newQueryCache) => {
      const newToken = newQueryCache.getQueryData([QUERY_KEY]) as
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

export const logout = async () => {
  try {
    onLogout();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Logout effect failed', error);
  } finally {
    queryCache.setQueryData(QUERY_KEY, undefined);
    localStorage.removeItem(QUERY_KEY);
  }
};

export const init = (initValue?: Token) => {
  const token = initValue || getTokenFromLocalStorage();

  if (initValue && token) {
    saveTokenToLocalStorage(token);
  }

  if (token && refreshTokenExpired(token)) {
    logout();
    return;
  }

  queryCache.setQueryData(QUERY_KEY, token);
};

export const login = async (data: LoginRequestData) => {
  const newToken = await queryCache.prefetchQuery({
    queryKey: [QUERY_KEY],
    variables: [data],
    queryFn: sendLogin,
    config: {
      staleTime: Infinity,
      cacheTime: Infinity,
      force: true,
      retry,
      throwOnError: true
    }
  });

  saveTokenToLocalStorage(newToken);

  return newToken;
};

export const refresh = async (throwError = true) => {
  try {
    const token = queryCache.getQueryData(QUERY_KEY) as Token;
    const newToken = await queryCache.prefetchQuery({
      queryKey: [QUERY_KEY],
      variables: [token],
      queryFn: sendRefresh,
      config: {
        staleTime: Infinity,
        cacheTime: Infinity,
        force: true,
        retry,
        throwOnError: true
      }
    });

    saveTokenToLocalStorage(newToken);

    return newToken;
  } catch (error) {
    if (throwError) {
      throw error;
    }
  }

  return undefined;
};

export const getToken = async () => {
  const currenToken = queryCache.getQueryData(QUERY_KEY) as Token | undefined;

  if (!currenToken) {
    return currenToken;
  }

  if (!tokenExpired(currenToken)) {
    if (shouldRefreshOnBackground(currenToken)) {
      refresh(false);
    }

    return currenToken;
  }

  if (refreshTokenExpired(currenToken)) {
    throw refreshExpiredError();
  }

  const newToken = await refresh();
  return newToken;
};

export const useLoginRequest = () => {
  const [data, setData] = useState<Token | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<ErrorType | null>(null);

  const requestLogin = async (request: LoginRequestData) => {
    setIsFetching(true);
    setData(null);
    setError(null);

    let result;

    try {
      result = await sendLogin(QUERY_KEY, request);
      setIsFetching(false);
      setData(result);

      saveTokenToLocalStorage(result);
      queryCache.setQueryData(QUERY_KEY, result);
    } catch (loginError) {
      setIsFetching(false);
      setError(loginError as ErrorType);
    }
    return result;
  };

  return { data, isFetching, error, requestLogin };
};

init();
