import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useLogin } from './token-query';
import Clock from './Clock';

const milisToTime = (milis: number) =>
  new Date(milis).toTimeString().split(' ')[0];

function App() {
  const { data: token, refetch, isFetching } = useLogin({
    email: 'test@example.com'
  });

  const isLoggedIn = token !== undefined;

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
            <button type="button" onClick={() => refetch()}>
              {isFetching ? '...' : 'Login'}
            </button>
          </div>
        ) : (
          <div>
            <ul>{token && <li>token: {milisToTime(token?.token)}</li>}</ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
