import React from 'react';
import { ReactQueryDevtools } from 'react-query-devtools';

import logo from './logo.svg';
import './App.css';
import Clock from './Clock';
import Login from './Login';
import Private from './Private';
import { useToken } from './example/example';

function App() {
  const token = useToken();
  const isLoggedIn = token !== undefined;

  return (
    <>
      <div className="App">
        <header className="App-header">
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
