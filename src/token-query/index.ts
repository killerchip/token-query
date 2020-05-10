/* eslint-disable import/prefer-default-export */
import { useQuery } from 'react-query';
import { LoginRequestData, QUERY_KEY, sendLogin } from './definitions';

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
