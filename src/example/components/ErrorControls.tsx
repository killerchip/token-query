import React, { FC, useState } from 'react';
import { ResponseState, setResponse } from '../errorSimulator';

const ErrorControls: FC = () => {
  const [loginResponse, setLoginResponse] = useState<ResponseState>('normal');
  const [refreshResponse, setRefreshResponse] = useState<ResponseState>(
    'normal'
  );
  const [meResponse, setMeResponse] = useState<ResponseState>('normal');

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div>
        <h6>Login</h6>
        <select
          value={loginResponse}
          onChange={(event) => {
            setLoginResponse(event.target.value as ResponseState);
            setResponse(event.target.value as ResponseState, 'loginResponse');
          }}
        >
          <option value="normal">normal</option>
          <option value="permanent">permanent</option>
          <option value="temporary">temporary</option>
        </select>
      </div>

      <div>
        <h6>Refresh</h6>
        <select
          value={refreshResponse}
          onChange={(event) => {
            setRefreshResponse(event.target.value as ResponseState);
            setResponse(event.target.value as ResponseState, 'refreshResponse');
          }}
        >
          <option value="normal">normal</option>
          <option value="permanent">permanent</option>
          <option value="temporary">temporary</option>
        </select>
      </div>

      <div>
        <h6>Me</h6>
        <select
          value={meResponse}
          onChange={(event) => {
            setMeResponse(event.target.value as ResponseState);
            setResponse(event.target.value as ResponseState, 'meResponse');
          }}
        >
          <option value="normal">normal</option>
          <option value="permanent">permanent</option>
          <option value="temporary">temporary</option>
        </select>
      </div>
    </div>
  );
};

export default ErrorControls;
