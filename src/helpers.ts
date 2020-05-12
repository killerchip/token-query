/* eslint-disable import/prefer-default-export */
export const milisToTime = (milis: number) =>
  new Date(milis).toTimeString().split(' ')[0];
