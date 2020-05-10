import { useQuery, queryCache } from 'react-query';
import {
  LoginRequestData,
  QUERY_KEY,
  sendLogin,
  onLogout,
  Token
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

export const useLogin = (data: LoginRequestData) =>
  useQuery({
    queryKey: QUERY_KEY,
    variables: [data],
    queryFn: sendLogin,
    config: {
      manual: true,
      staleTime: Infinity,
      cacheTime: Infinity,
      onSuccess: (token) => {
        saveTokenToLocalStorage(token);
      }
    }
  });

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

init();
