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

...to be continued

## useLogin

## useToken

## logout

## refresh

## getToken
