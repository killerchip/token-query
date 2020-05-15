import React, { useState } from 'react';
import { ReactQueryDevtools } from 'react-query-devtools';

import logo from './logo.svg';
import './App.css';
import Clock from './Clock';
import Login from './Login';
import Private from './Private';
import { useToken } from './example/auth';
import { ResponseState, setResponse } from './example/errorSimulator';

function App() {
  const token = useToken();
  const isLoggedIn = token !== undefined;

  const [loginResponse, setLoginResponse] = useState<ResponseState>('normal');
  const [refreshResponse, setRefreshResponse] = useState<ResponseState>(
    'normal'
  );
  const [meResponse, setMeResponse] = useState<ResponseState>('normal');

  return (
    <>
      <div className="App">
        <header className="App-header">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div>
              <h6>Login</h6>
              <select
                value={loginResponse}
                onChange={(event) => {
                  setLoginResponse(event.target.value as ResponseState);
                  setResponse(
                    event.target.value as ResponseState,
                    'loginResponse'
                  );
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
                  setResponse(
                    event.target.value as ResponseState,
                    'refreshResponse'
                  );
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
                  setResponse(
                    event.target.value as ResponseState,
                    'meResponse'
                  );
                }}
              >
                <option value="normal">normal</option>
                <option value="permanent">permanent</option>
                <option value="temporary">temporary</option>
              </select>
            </div>
          </div>

          <Clock />
          <img
            src={logo}
            className="App-logo"
            alt="logo"
            style={{ width: 60, height: 60 }}
          />
          {isLoggedIn ? <Private /> : <Login />}
        </header>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

export default App;
