`token-query` is a tool to help you manage your authentication tokens in your react webapp.
It offers login & logout functionality, transparent token refreshing on per token request basis, and background refreshing, persistence in `localStorage`, etc.

It is based on and requires [`react-query`](https://github.com/tannerlinsley/react-query) package. So it better fits in projects that use `react-query` for remote data handling.

# Assumptions

`token-query` was designed to cover the following use-case regarding authentication:

During authentication your client app will send credentials to the authentication server and receive a set of tokens, the authentication token and the refresh token.

You use the refresh token to obtain a new authentication token if (or before) it expires.

The authentication token is used by your network client in each private request (typically as a request header). Your network client will request the token from `token-query`, without worrying about managing it.

# what `token-query` offers

- Network client agnostic: use `axios`, `fetch`, or anything else.
- Management of refreshing. Your network client just asks for a token. Nothing more.
- Auto refresh token when expired, refresh on background before it expires, and/or refresh on background periodically.
- Consolidate multiple refresh requests into one.
- Token persistence using `localStorage`.

# How to install

Just copy the source file `src\token-query\tokenQuery.ts` into your project.

Prerequesites:

- The project must be setup using `Typescript`
- install [`react-query`](https://github.com/tannerlinsley/react-query) package
- install [`lodash`](https://lodash.com/)

# Setup

Create a new query instance by providing a configuration object.

```
import createTokenQuery from './tokenQuery';

const exampleQuery = createTokenQuery<Token, LoginParams>({
  queryKey: 'token',
  tokenExpired,
  refreshExpired,
  sendLogin,
  sendRefresh,
  retry,
  refreshExpiredError: new Error('401-Refresh token expired'),
  shouldRefreshOnBackground
});
```

## TToken

Is the shape of your token set, as it will be stored and served by `token-query`.

example:

```
interface TToken {
    authToken: string;
    refreshToken: string;
    authTokenExpiry: number;
    refreshTokenExpiry: number;
}
```

## Login parameters

An object shape that hosts the parameters for the login request to the authentication server.

example:

```
interface TLoginParams {
    email: string;
    password: string;
}
```

## Configuration

The configuration object should have the following properties:

### queryKey (optional)

```
queryKey?: string = 'token';
```

The key that will be used by `react-query` to host the token, and the `localStorage` key. Defaults to `token`

### sendLogin

Your async newtork function that sends login request to the authentication server.
It should accept a single parameter of `TLoginParams` type and should return the token set as `TToken` type.

```
sendLogin: (loginParams: TLoginParams) => Promise<TToken>;
```

### sendRefresh

Your async network function that sends a refresh request to the authentication server.

It should expect the current token set as parameter and return the new one.

```
sendRefresh: (token: TToken) => Promise<TToken>;
```

### retry

This function should provide the decision logic on wether a failed attempt (login or refresh) should be retried.

It should accept two parameters:

- `failCount`: the number of retries so far
- `error`: the error occured from the last failed request.

It should return a boolean result indicating if another attempt should be made.

example: Retry 3 times, but not if the error is a permanent one (e.g. wrong credentials)

```
const retry = (count: number, error: Error) =>
  count < 3 && !error.statusCode === 401;

```

See [`react-query`](https://github.com/tannerlinsley/react-query) for more details

### tokenExpired

This function should provide the logic for determining if the authentication token expired or not.

```
tokenExpired: (token: TToken) => boolean;
```

### refreshExpired

This function should provide the logic for determining if the refresh token expired or not.

```
refreshExpired: (token: TToken) => boolean;
```

### refreshExpiredError

If `token-query` determines that the refresh token has already expired, it will not lauch a refresh request at all, but will throw an error.

Determine here what error you wish to be thrown back to your network client. It can be of `any` type.

### shouldRefreshOnBackground (optional)

When your client request an authentication token from `token-query`, and the token is still valid, the latter will return the token immediately.

You can have it trigger a background refresh operation, so you can refresh the token before it actually expires. (so there's no delay on the requests waiting for the token to refresh)

Provide the funcation that implements the decision logic on launching the background refresh operation or not. If it is missing, `token-query` will not check for lauching background refresh on each token request by network clients.

```
shouldRefreshOnBackground?: (token: TToken) => boolean;
```

# Use

Once you create an instance of `token-query`, the instance provide to you a set of usefull functions:

```
const exampleQuery = createTokenQuery<Token, LoginParams>({
  queryKey: 'token',
  tokenExpired,
  refreshExpired,
  sendLogin,
  sendRefresh,
  retry,
  refreshExpiredError: new Error('401-Refresh token expired'),
  shouldRefreshOnBackground
});
```

This will create an object with utility functions.

```
const { init, useToken, useLogin, logout, refresh, getToken } = exampleQuery;
```

## init

You must use this first to initialize the query.

example:

```
exampleQuery.init(1000 * 60 * 40); // 40 min
```

On initialization `token-query` attempts to load any stored token from the `localStorage`. If the refresh-token has expired then it will ignore it and remove it from the storage.

You can pass an optiona parameter of interval in milliseconds. This will trigger a periodic token refresh in the backround. If not provided no periodic refresh will trigger.

`token-query` also automatically persist the token in the `localStorage` of the browser, on each refresh/login.

## useLogin

This is a hook that exposes state and funcationality for reuesting (login) a new token.

```
const { data, isFetching, error, requestLogin } = exampleQuery.useLogin();
```

- `data` stores the token returned by the login process
- `isFetching` (boolean) indicates if the login is in progress or not
- `error` stores the error if the last login attempt failed

`requestLogin` is an async function for triggering a login. You can use it in two ways:

_As hook_
You can just fire it up and have the hook manage your component's lifecycle.

example:

```
const { data, isFetching, error, requestLogin } = exampleQuery.useLogin();

return (
    <button
        onClick={() => requestLogin({email, password})} // credentials derived from a login form
    >
        {isFetching ? 'in-progress' : 'Login'}
    </button>

    {error && <p>{error.message}</p>}
)
```

_As async function_
Or you can handle the `requestLogin` function in async way:

example:

```
    const {requestLogin} = exampleQuery.useLogin();

    const login = asyc (email, password) => {
        try {
            await requestLogin({email, password}, true); // pass TRUE as optional parameter to throw error on failure
            // and do stuff on successfull login
        } catch(error) {
            // do something with error
        }
    }
```

By default `requestLogin` will suppress any error. If you pass `true` as second parameter it will throw any error occured during the process.

_`requestLogin`_:

```
const requestLogin = async (
    loginParams: TLoginParams,
    throwOnError = false
) => {/* ... */}
```

## useToken

The `useToken` hook provides the current token stored in the query.

example:

```
const token = exampleQuery.useToken();

return token !== undefined ? <PrivateRoute> : <PublicRoute>;
```

## logout

Call the `logout` function you want to logout from your app.
It will clear token and any scheduled background refresh operation.

example:

```
<button
    onClick={() => {
        exampleQuery.logout();
        // other logout steps
    })}
>
    Logout
</button>
```

## refresh

Use the `refresh` async function in any case you wish to manually trigger a token refresh operation. It will launch a refresh operation using the currently stored token.

example:

```
const manualRefresh = async () => {
    try {
        await exampleQuery.refresh(true)
    } catch (error) {
        //do something with error
    }
}
```

`refresh` function will take `throwOnError` optional parameter. If `true`, it will throw any error that occured during refresh process. By default it will supress the error.

## getToken

This is core function of `token-query`. Your network clients should use this to get and use the current authentication token.

example:

```
const fetchUserProfile = async () => {
    const token = await exampleQuery.getToken();
    // here inject the token and send the actual request
}
```

`getToken` will return immediately the stored token if it valid. If you want to force it to refresh the token even it if has not expired, then you can pass `true` as parameter to force it refresh a token before returning it.

```
const getToken = async (force = false) => {/*...*/}
```

`getToken` async function acts as follows:

- If there is no token, it will return the `undefined` value.
- If the refresh token expired then it will throw the `refreshExpiredError` (see setup)
- If the token itself has expired or `force` parameter is passed, then it will launch refresh and return the new one.
- If the above refresh operation fails, it will throw the error that occured.
- If the token has not expired and it is not `force`ed, it will return immediately the stored token.
- If a `shouldRefreshOnBackground` condition is setup and met, it will launch a background refresh operation.
- Refresh error on background operations are supressed.
- In case multiple clients request for a token while it is refreshing, only one request is lauched towards authentication server. Once resolved, all client requests receive the same token.

## Example

You can find the source code of an example project under `src/example`.

To run test the example as follows:

1. Clone this project locally
1. `yarn install`
1. `yarn start`

# License

MIT License

Copyright 2020, Costas Ioannou

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
