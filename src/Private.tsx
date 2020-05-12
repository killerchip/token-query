import React, { FC, useState } from 'react';
import { useToken, logout, refresh } from './token-query';
import { milisToTime } from './helpers';
import { GRACE_PERIOD } from './token-query/definitions';
import { fetchMe } from './api/api';

const Private: FC = () => {
  const token = useToken();
  console.log(token);

  const [me, setMe] = useState('');
  const onFetchMe = async () => {
    setMe('...');
    try {
      const data = await fetchMe();
      setMe(data);
    } catch (error) {
      setMe(error.message);
    }
  };

  return (
    <div>
      <ul style={{ listStyle: 'none' }}>
        {token && <li>grace: {milisToTime(token?.token - GRACE_PERIOD)}</li>}
        {token && <li>token: {milisToTime(token?.token)}</li>}
        {token && <li>refresh: {milisToTime(token?.refresh)}</li>}
        {token && <li>{token?.holder}</li>}
      </ul>
      <p>me: {me}</p>

      <button type="button" onClick={logout}>
        Logout
      </button>

      <button type="button" onClick={() => refresh()}>
        Refresh Manually
      </button>

      <button type="button" onClick={onFetchMe}>
        Fetch me
      </button>
    </div>
  );
};

export default Private;
