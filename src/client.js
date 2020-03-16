const fetch = require('node-fetch');

const { ensureSuffix } = require('./util');

const newObjectWithClassName = (name, extra) => {
  const C = class {};
  Object.defineProperty(C, 'name', { value: name });
  const o = new C();
  Object.assign(o, extra);
  return o;
};

const remoteFunctionWrapper = functionEndpoint => async (...input) => {
  const response = await fetch(functionEndpoint, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  // TODO: throw exception if parse fails
  const data = await response.json();

  if (response.status === 500) {
    const exceptionType = response.headers.get('x-exception');
    throw newObjectWithClassName(exceptionType, data);
  }

  return data;
};

const getNamespaceFromResponse = (data, f, prefix = []) => {
  const keys = Object.keys(data);
  const result = {};
  for (let key of keys) {
    const value = data[key];
    const path = [...prefix, key];
    if (value === '$') {
      result[key] = f(path);
    } else {
      result[key] = getNamespaceFromResponse(value, f, path);
    }
  }

  return result;
};

module.exports = async ({ endpoint = '/' } = { endpoint: '/' }) => {
  endpoint = ensureSuffix(endpoint, '/');

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'get',
    });
  } catch (e) {
    console.error('Failed to initialize API namespace.');
    return {};
  }

  const body = await response.json();

  const namespace = getNamespaceFromResponse(body, path =>
    remoteFunctionWrapper(endpoint + path.join('/'))
  );

  return namespace;
};
