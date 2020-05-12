import React, { FC } from 'react';
import { useQuery } from 'react-query';

import { useToken, logout, refresh } from './token-query';
import { milisToTime } from './helpers';
import { GRACE_PERIOD } from './token-query/definitions';
import { fetchMe } from './api/api';

const Private: FC = () => {
  const token = useToken();

  const { data, isFetching, refetch } = useQuery('ME', fetchMe);

  return (
    <div>
      <ul style={{ listStyle: 'none' }}>
        {token && <li>grace: {milisToTime(token?.token - GRACE_PERIOD)}</li>}
        {token && <li>token: {milisToTime(token?.token)}</li>}
        {token && <li>refresh: {milisToTime(token?.refresh)}</li>}
        {token && <li>{token?.holder}</li>}
      </ul>
      <p>
        me: {isFetching && '...'} {data}
      </p>

      <button type="button" onClick={logout}>
        Logout
      </button>

      <button type="button" onClick={() => refresh()}>
        Refresh Manually
      </button>

      <button type="button" onClick={() => refetch({ force: true })}>
        Fetch me
      </button>
    </div>
  );
};

export default Private;
