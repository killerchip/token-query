/* eslint-disable import/prefer-default-export */
import { useQuery, queryCache } from 'react-query';
import {
  LoginRequestData,
  QUERY_KEY,
  sendLogin,
  onLogout
} from './definitions';

export const useLogin = (data: LoginRequestData) =>
  useQuery({
    queryKey: QUERY_KEY,
    variables: [data],
    queryFn: sendLogin,
    config: {
      manual: true,
      staleTime: Infinity,
      cacheTime: Infinity
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
  }
};
