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
  onPermanentRefreshError,
  ErrorType
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
  const [token, setToken] = useState<Token>();

  useEffect(() => {
    const unsubscribe = queryCache.subscribe((newQueryCache) => {
      const newToken = newQueryCache.getQueryData([QUERY_KEY]) as
        | Token
        | undefined;

      if (!isEqual(token, newToken)) {
        setToken(newToken);
      }
    });

    return () => unsubscribe();
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

export const refresh = async (throwError = false) => {
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
    await onPermanentRefreshError(error, logout);

    if (throwError) {
      throw error;
    }

    return undefined;
  }
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
      result = await login(request);
      setData(result);
    } catch (loginError) {
      setError(loginError as ErrorType);
    } finally {
      setIsFetching(false);
    }

    return result;
  };

  return { data, isFetching, error, requestLogin };
};

init();
