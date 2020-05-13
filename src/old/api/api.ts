import { getToken, logout } from '../token-query';
import { Token, isPermanentError, ErrorType } from '../token-query/definitions';

// eslint-disable-next-line import/prefer-default-export
export const privateRequest = async (
  caller: (token: Token | undefined, ...args: any[]) => Promise<any>
) => {
  try {
    const token = await getToken();
    console.log('got token', token?.token);

    return caller(token).catch((error: ErrorType) => {
      console.log('caller caught', error);
      if (isPermanentError(error)) {
        console.log('is Permannent', error);
        logout();
        alert('Permanent Error');
      }

      throw error;
    });
  } catch (error) {
    if (isPermanentError(error)) {
      console.log('is Permannent', error);
      logout();
      alert('Permanent Error');
    }

    throw error;
  }
};

export const fetchMe = () =>
  privateRequest(
    (token) =>
      new Promise<string>((resolve) =>
        setTimeout(() => resolve(`John Doe - ${token?.token}`), 1500)
      )
  );
