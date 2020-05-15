import React from 'react';
import { ReactQueryDevtools } from 'react-query-devtools';

import logo from './logo.svg';
import './App.css';
import Clock from './example/components/Clock';
import Login from './example/components/Login';
import Private from './example/components/Private';
import { useToken } from './example/auth';
import ErrorControls from './example/components/ErrorControls';

function App() {
  const token = useToken();
  const isLoggedIn = token !== undefined;

  return (
    <>
      <div className="App">
        <header className="App-header">
          <ErrorControls />
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
