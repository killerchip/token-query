import React, { FC } from 'react';
import { useLoginRequest } from './token-query';

const Login: FC = () => {
  const { isFetching, requestLogin } = useLoginRequest();

  return (
    <div>
      <button
        type="button"
        onClick={() => requestLogin({ email: 'test@example.com' })}
      >
        {isFetching ? '...' : 'Login'}
      </button>
    </div>
  );
};

export default Login;
