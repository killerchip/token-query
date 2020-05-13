import React from 'react';
import logo from './logo.svg';
import './App.css';
import Clock from './Clock';
import Login from './Login';
import Private from './Private';

function App() {
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
        {false ? <Private /> : <Login />}
      </header>
    </div>
  );
}

export default App;
