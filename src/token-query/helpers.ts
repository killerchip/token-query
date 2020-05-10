/* eslint-disable import/prefer-default-export */
const TOKEN_DURATION = 1000 * 60 * 1;
const REFRESH_DURATION = 1000 * 60 * 60;

export const generateToken = (holder: string) => {
  const now = new Date().getTime();

  return {
    token: now + TOKEN_DURATION,
    refresh: now + REFRESH_DURATION,
    holder
  };
};
