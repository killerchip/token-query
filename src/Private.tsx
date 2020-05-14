import React, { FC } from 'react';
import { useQuery } from 'react-query';

import { milisToTime } from './helpers';
import { useToken, logout, refresh } from './example/example';
import { fetchMe } from './example/api';

const Private: FC = () => {
  const token = useToken();

  const { data: me, isFetching, refetch } = useQuery('me', fetchMe);

  return (
    <div>
      <ul style={{ listStyle: 'none' }}>
        {token && <li>token expires: {milisToTime(token.token)}</li>}
        {token && <li>refresh expires: {milisToTime(token.refresh)}</li>}
        {token && <li>holder: {token.holder}</li>}
      </ul>
      <p>
        me: {isFetching && '...'} {me}
      </p>

      <button
        type="button"
        onClick={() => {
          logout();
        }}
      >
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
