import React, { FC } from 'react';

const Private: FC = () => {
  return (
    <div>
      <ul style={{ listStyle: 'none' }}>
        <li>token info here</li>
      </ul>
      <p>me:</p>

      <button type="button" onClick={() => {}}>
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
