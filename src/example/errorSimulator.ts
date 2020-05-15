export type ResponseState = 'normal' | 'permanent' | 'temporary';

export const responses: {
  loginResponse: ResponseState;
  refreshResponse: ResponseState;
  meResponse: ResponseState;
} = {
  loginResponse: 'normal',
  refreshResponse: 'normal',
  meResponse: 'normal'
};

export const setResponse = (
  response: ResponseState,
  prop: 'loginResponse' | 'refreshResponse' | 'meResponse'
) => {
  responses[prop] = response;
};
