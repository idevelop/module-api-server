const fetch = require('node-fetch');

const { ensureSuffix } = require('./util');

const PREFIX = Symbol('prefix');

const proxyHandler = {
  get: (target, property) => createProxy([...target[PREFIX], property]),

  apply: async (target, _this, arguments) =>
    await callRemoteFunction(
      target[PREFIX][0],
      target[PREFIX].slice(1),
      arguments
    ),
};

const createProxy = (prefix = []) => {
  const f = () => {};
  f[PREFIX] = prefix;
  return new Proxy(f, proxyHandler);
};

// Used to recreate and throw the remote exception
const newObjectWithClassName = (name, extra) => {
  const C = class {};
  Object.defineProperty(C, 'name', { value: name });
  const o = new C();
  Object.assign(o, extra);
  return o;
};

const callRemoteFunction = async (apiEndpoint, functionPath, arguments) => {
  const endpoint = apiEndpoint + functionPath.join('/');
  const response = await fetch(endpoint, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(arguments),
  });

  if (response.status === 404) {
    throw new ReferenceError(`${functionPath.join('.')} is not defined`);
  }

  const data = await response.json();

  if (response.status === 500) {
    const exceptionType = response.headers.get('x-exception');
    throw newObjectWithClassName(exceptionType, data);
  }

  return data;
};

module.exports = ({ endpoint = '/' } = { endpoint: '/' }) =>
  createProxy([ensureSuffix(endpoint, '/')]);
