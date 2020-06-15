# Module API Server

Instantly expose server-side node modules through a REST API.

```js
// server side

module.exports = { hello: name => `hello ${name}` };
```

```bash
npx module-api-server ./my-module.js

> Loaded namespace { hello: [Function: hello] }
> Serving on port 1234, endpoint: /api, CORS enabled

```

```js
// client side

const client = require('module-api-client');
const api = client();
const result = await api.hello('andrei');
// => hello andrei
```

That's it.

## How it works

On the server-side, the library loads your modules into a unified namespace and exposes it through a simple REST API.

Start a standalone server through the `npx` CLI:

```
npx module-api-server -p 1234 --cors --endpoint=/api my-modules/hello my-modules/time
```

```
Loaded namespace { time: [Function], hello: [Function: hello] }
Serving on port 1234, endpoint: /api, CORS enabled
```

Or you can attach as middleware to your existing express server:

```
npm install module-api-server
```

```js
const express = require('express');
const app = express();

const { middleware } = require('module-api-server').server({
  paths: [...], // array of module absolute paths
  modules: {...}, // map of preloaded modules
  endpoint: '/api', // optional, defaults to /
  cors: false, // optional, defaults to false
});

app.use(middleware);
```

The [client library](https://github.com/idevelop/module-api-client) first fetches the namespace through the API and mirrors it as local async functions (promises). When a local function is executed, the library calls into its remote counterpart through the API and returns the result value.

```js
import client from 'module-api-client';

const api = client({
  endpoint: '/api', // optional, defaults to /
});

// POST /api/hello ["andrei"] => "hello andrei"
const result = await api.hello('andrei');
```

## Author

**Andrei Gheorghe**

- [About me](https://andrei.codes)
- LinkedIn: [linkedin.com/in/idevelop](http://www.linkedin.com/in/idevelop)
- Twitter: [@idevelop](http://twitter.com/idevelop)
