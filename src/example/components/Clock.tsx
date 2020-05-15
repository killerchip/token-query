import React, { FC, useState, useEffect } from 'react';

const getTime = () => new Date().toTimeString().split(' ')[0];

const Clock: FC = () => {
  const [time, setTime] = useState(getTime());

  useEffect(() => {
    const handler = setInterval(() => {
      setTime(getTime());
    }, 1000);

    return () => clearInterval(handler);
  }, []);

  return <h6>{time}</h6>;
};

export default Clock;
