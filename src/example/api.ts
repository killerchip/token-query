/* eslint-disable no-alert */
/* eslint-disable no-console */
import { getToken, logout, Token } from './example';
import { milisToTime } from '../helpers';

export async function privateRequest<TResult>(
  caller: (token: Token) => Promise<any>
) {
  try {
    const token = (await getToken()) as Token;
    const result = (await caller(token)) as TResult;

    return result;
  } catch (error) {
    if ((error as Error).message.includes('401-')) {
      console.log('is Permannent', error);
      alert('Permanent Error');

      logout();
    }
    throw error;
  }
}

export const fetchMe = () =>
  privateRequest(
    (token) =>
      new Promise<string>((resolve) =>
        setTimeout(
          () => resolve(`John Doe - ${milisToTime(token?.token)}`),
          1500
        )
      )
  );
