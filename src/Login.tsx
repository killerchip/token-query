import React, { FC } from 'react';
import { useLogin } from './example/auth';

const Login: FC = () => {
  const { isFetching, requestLogin } = useLogin();

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
