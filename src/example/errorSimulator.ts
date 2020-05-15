export type ResponseState = 'normal' | 'permanent' | 'temporary';

interface Responses {
  loginResponse: ResponseState;
  refreshResponse: ResponseState;
  meResponse: ResponseState;
}

export const responses: Responses = {
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
