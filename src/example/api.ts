/* eslint-disable no-alert */
import { getToken, logout, Token } from './auth';
import { milisToTime } from '../helpers';

export async function privateRequest<TResult>(
  asyncFunc: (token: Token) => Promise<any>
) {
  try {
    const token = (await getToken()) as Token;

    // simulate that use of token in asyncFun
    // typically the token will be injected in the headers
    // that async func calls
    const result = (await asyncFunc(token)) as TResult;

    return result;
  } catch (error) {
    if ((error as Error).message.includes('401-')) {
      alert('Permanent Error. You will have to re-login');

      logout();
    }
    throw error;
  }
}

// simulating fetching user's profile which is based
// on authentication token
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
