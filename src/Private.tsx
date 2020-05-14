import React, { FC } from 'react';
import { milisToTime } from './helpers';
import { useToken, logout } from './example/example';

const Private: FC = () => {
  const token = useToken();

  return (
    <div>
      <ul style={{ listStyle: 'none' }}>
        {token && <li>token expires: {milisToTime(token.token)}</li>}
        {token && <li>refresh expires: {milisToTime(token.refresh)}</li>}
        {token && <li>holder: {token.holder}</li>}
      </ul>
      <p>me:</p>

      <button
        type="button"
        onClick={() => {
          logout();
        }}
      >
        Logout
      </button>

      <button type="button" onClick={() => {}}>
        Refresh Manually
      </button>

      <button type="button" onClick={() => {}}>
        Fetch me
      </button>
    </div>
  );
};

export default Private;
