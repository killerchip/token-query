import { queryCache } from 'react-query';
import { useState, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import { sendRefresh } from '../old/token-query/definitions';

export interface Config<Token, LoginParams> {
  queryKey: string;
  tokenExpired: (token: Token) => boolean;
  refreshExpired: (token: Token) => boolean;
  sendLogin: (loginParams: LoginParams) => Promise<Token>;
  sendRefresh: (token: Token) => Promise<Token>;
}

function createTokenQuery<Token, LoginParams, ErrorType>({
  queryKey,
  tokenExpired,
  refreshExpired,
  sendLogin,
  sendRefresh
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

  const login = async (loginParams: LoginParams) => {
    const token = await sendLogin(loginParams);

    setTokenValue(token);

    return token;
  };

  const logout = async () => {
    setTokenValue(undefined);
  };

  const useLogin = () => {
    const [data, setData] = useState<Token | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<ErrorType | null>(null);

    const requestLogin = async (loginParams: LoginParams) => {
      setIsFetching(true);
      setData(null);
      setError(null);

      try {
        const token = await sendLogin(loginParams);

        setIsFetching(false);
        setData(token);
        setTokenValue(token);

        return token;
      } catch (loginError) {
        setIsFetching(false);
        setError(loginError as ErrorType);
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

    try {
      const newToken = await sendRefresh(token);
      setTokenValue(newToken);
    } catch (error) {
      if (throwOnError) {
        throw error;
      }
    }
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

  return { init, login, useLogin, useToken, logout, refresh };
}

export default createTokenQuery;
