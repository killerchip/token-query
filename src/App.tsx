import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useToken, logout, refresh, useLoginRequest } from './token-query';
import Clock from './Clock';

const milisToTime = (milis: number) =>
  new Date(milis).toTimeString().split(' ')[0];

function App() {
  const token = useToken();

  const isLoggedIn = token !== undefined;

  const { isFetching, requestLogin } = useLoginRequest();

  return (
    <div className="App">
      <header className="App-header">
        <Clock />
        <img
          src={logo}
          className="App-logo"
          alt="logo"
          style={{ width: 60, height: 60 }}
        />
        {!isLoggedIn ? (
          <div>
            <button
              type="button"
              onClick={() => requestLogin({ email: 'test@example.com' })}
            >
              {isFetching ? '...' : 'Login'}
            </button>
          </div>
        ) : (
          <div>
            <ul style={{ listStyle: 'none' }}>
              {token && <li>token: {milisToTime(token?.token)}</li>}
              {token && <li>refresh: {milisToTime(token?.refresh)}</li>}
              {token && <li>{token?.holder}</li>}
            </ul>

            <button type="button" onClick={logout}>
              Logout
            </button>
            <button type="button" onClick={() => refresh()}>
              Refresh Manually
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
