/* eslint-disable no-alert */
import React, { FC, useEffect } from 'react';
import { useLogin } from '../auth';

const Login: FC = () => {
  const { isFetching, requestLogin, error } = useLogin();

  useEffect(() => {
    if (error) {
      alert((error as Error).message);
    }
  }, [error]);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          requestLogin({ email: 'a@example.com' });
        }}
      >
        {isFetching ? '...' : 'Login'}
      </button>
    </div>
  );
};

export default Login;
