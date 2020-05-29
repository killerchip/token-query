This is a small library that will help you manage authentication token and refresh token.

It is based on `react-query`.

# Use case

Typically during login you will get from backend-server an authentication token and a refresh token.

You will be using your authentication token to launch authenticated requests towards your server (typically injecting it as request header).

The token has a expiration time. You should be able to refresh the authentication token by launching a corresponding request to the backend server, using the provided refresh token.

The refresh token itself has an expiration time. If the refresh token expires then the user must re-login in order to be authenticated again.

# what `token-query` offers

- Seamlessly refreshing the token if expires, while authenticated requets are lauched.
- Support for multiple concurrent refresh requests while consoliding into a single request.
- Ability to launch token refresh operation in background before it expires.
- Ability to launch token refresh operation in background repeatedly in background to keep the user logged in.
- Integrated token storage, and clean up on logout.

# How to install

Just copy the source file `src\token-query\tokenQuery.ts` into your project.

The project must be setup using `Typescript`

Add the following packages that the library needs.

- `react-query`
- `loadash`

# How to initialize the library

You must create an instance of the library with specific configuration options and then initialize it.

The created instance will export utility functions to integrate token management with your codebase.

Run `createTokenQuery` to create an instance.

```
import createTokenQuery from '../token-query/tokenQuery';

const configuration = ... // a configuration object

const tokenQuery = createTokenQuery<TToken, TLoginParams>(configuration);
```

## Token and LoginParams types

When you create a tokenQuery object, you have to declare the shape of the Token and an object that the login process will use when login-in to the backend.

For example, this could be a Token type:

```
interface TToken {
    authToken: string;
    refreshToken: string;
    authTokenExpiry: number;
    refreshTokenExpiry: number;
}
```

And login parameters could be:

```
interface TLoginParams {
    email: string;
    password: string;
}
```

## Configuration

For creating an instance, you must provide a configuration object that has the following properties:

### queryKey (optional)

```
queryKey?: string = 'token';
```

This key will be used by `react-query` library to store the tokens. It will also be used for saving the tokens in `localStorage`.

### sendLogin

The async function that will be called for login/fetching authentication token. It expects as parameters an object of type `TLoginParams` and it should return the token of type `TToken`.

```
sendLogin: (loginParams: TLoginParams) => Promise<TToken>;
```

### sendRefresh

The async function that will be called for refreshing the authentication token. It expects as parameters the token set `TToken` and it should return the new token set.

```
sendRefresh: (token: TToken) => Promise<TToken>;
```

### retry

This function provides the logic for deciding if an attempt (login or refresh) should be retried or not.

It will be called with the past `failCount` from previous retries and the last error. It should return true if another attempt should occur. (See `react-query` for more details).

An example would be to retry 3 times, but not if the error is a permanent one (e.g. wrong credentials)

```
const retry = (count: number, error: Error) =>
  count < 3 && !error.statusCode === 401;

```

### tokenExpired

This function will be called to determine if the token has expired. It accepts the current token set `TToken` and it should return `true` if the token expired.

```
tokenExpired: (token: TToken) => boolean;
```

### refreshExpired

This function will be called to determine if the refresh token has expired. Same as above:

```
refreshExpired: (token: TToken) => boolean;
```

### refreshExpiredError

When your client will request a token from `token-query`, and the refresh token has already expired, `token-query` will throw the `refreshExpiredError` to indicate this.

### shouldRefreshOnBackground (optional)

When your client request a token, and the token is not yet expired, `token-query` will immediately return the current token. But you might want to trigger in the background a token refresh, to have a new token ready, before it expires.

If you define `shouldRefreshOnBackground` function, with each token request, this function wll be called (with the current token as parameter). If it returns true a background refresh will be lauched.

```
shouldRefreshOnBackground?: (token: TToken) => boolean;
```

# How to use

You should create an instance of `token-query` by providing it with necessary types for token and login parameters and the above described configuration.

```
const mockTokenQuery = createTokenQuery<Token, LoginParams>({
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

## init

First you have to initialize the `token-query`

```
mockTokenQuery.init(1000 * 60); // 1min
```

You can optionally pass an interval (ms), which will be triggering a periodic refresh in the backround. If you don't provide parameter then the periodic refresh will be scheduled (only the token-request based refresh will take place).

`token-query` also automatically persist the token in the `localStorage` of the browser, on each refresh/login. On initialization it will load any stored token from the `localStorage`. If the refresh-token has expired then it will ignore it and remove it from the storage.

## useLogin

This is a hook that exposes state and funcationality for reuesting (login) a new token.

```
const { data, isFetching, error, requestLogin } = mockQuery.useLogin();
```

- `data` holds the result after the login process
- `isFetching` (boolean) indicates that the login process is in progress
- `error` holds the error if the last login attempt failed

**requestLogin**
You can use `requestLogin` async function in two ways.

You can just fire it up and have the hook manage your component's lifecycle.

example:

```
const { data, isFetching, error, requestLogin } = mockQuery.useLogin();

return (
    <button
        onClick={() => requestLogin({email, password})} // credentials derived from a login form
    >
        {isFetching ? 'in-progress' : 'Login'}
    </button>

    {error && <p>{error.message}</p>}
)
```

Or you can handle the `requestLogin` function in async way:

example:

```
    const {requestLogin} = mockQuery.useLogin();

    const login = asyc (email, password) => {
        try {
            await requestLogin({email, password}, true); // pass TRUE as optional parameter to throw error on failure
            // and do stuff on successfull login
        } catch(error) {
            // do something with error
        }
    }
```

Don't forget to pass the `throwOnError = true` parameter if you want to catch and handle failures.
By default `requestLogin` will suppress errors.

Here's the declaration of `requestLogin`

```
const requestLogin = async (
    loginParams: TLoginParams,
    throwOnError = false
) => {/* implementation here */}
```

## useToken

The `useToken` hook allow you to use the current token on any component you wish.

example:

```
const token = mockQuery.useToken();

return token !== undefined ? <PrivateRoute> : <PublicRoute>;
```

## logout

Call the `logout` function you want to logout from your app.
It will delete the current token and will stop any scheduled background refresh operation.

example:

```
<button
    onClick={() => {
        mockQuery.logout();
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
        await mockQuery.refresh(true)
    } catch (error) {
        //do something with error
    }
}
```

`refresh` function will take `throwOnError` optional parameter. If true, it will throw on refresh failure. By default it will supress the error (used in background refreshing).

## getToken

This is core function of `token-query`. You should use this function from your client functions that need to inject the authentication token in their requests.

example:

```
const fetchUserProfile = async () => {
    const token = await mockQuery.getToken();

    // here inject the token and send the actual request
}
```

`getToken` will return immediately the stored token if it has not expired. If you want to force it to refresh the token even it if has not expired, then you can pass the `true` as parameter to force it refresh a token before returning it.

```
const getToken = async (force = false) => {/*...*/}
```

In particular `getToken` function will behave as follows:

- If there is no token, it will return undefined
- If the refresh token expired then it will throw the `refreshExpiredError` (provided during configuration setup)
- If the token itself has expired or `force` parameter is passed, then it will attempt to refresh token and then it will return the new token. If the process fails, it will throw error of the failed attempt.
- If the token has not expired and it is not `force`ed, it will return immediately the stored token. But if a `shouldRefreshOnBackground` condition is setup and the condition is met, it will launch a background refresh.

Note that background refresh supress any errors, and do not throw. Also if multiple client request a token `concurrently` and a token refresh is in progress, only one refresh operation is launched towards the server, and all clients will be served the same new token once fetched.

## Example

You can find an implementation example project under `src/example` on how to use `token-query`.

This whole project is a react project demonstrating the use of `token-query`. You just have to:

1. Clone the project locally
1. `yarn install`
1. `yarn start`

# License

MIT License

Copyright 2020, Costas Ioannou

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
