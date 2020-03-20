const { ensurePrefixAndSuffix } = require('./util');

const getNamespaceJSON = namespace =>
  JSON.stringify(namespace, (_, value) => {
    if (['Function', 'AsyncFunction'].includes(value.constructor.name)) {
      return '$';
    } else {
      return value;
    }
  });

const findFunction = (functionPath, namespace) => {
  const path = functionPath.slice(0, -1);
  let current = namespace;
  for (let p of path) {
    current = current[p];
    if (current === undefined) {
      return undefined;
    }
  }

  const name = functionPath[functionPath.length - 1];
  return current[name];
};

const requestHandler = (namespace, { endpoint = '/', cors = false }) => (
  request,
  response
) => {
  let { method, url } = request;

  url = ensurePrefixAndSuffix(url, '/');
  endpoint = ensurePrefixAndSuffix(endpoint, '/');

  if (!url.startsWith(endpoint)) {
    // request is not handled here
    return false;
  }

  const bodyChunks = [];

  request
    .on('data', chunk => bodyChunks.push(chunk))
    .on('error', err => console.error(err))
    .on('end', async () => {
      response.setHeader('Content-Type', 'application/json');

      if (cors) {
        response.setHeader('Access-Control-Allow-Methods', 'get, post');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Headers', '*');
      }

      if (method === 'OPTIONS') {
        response.writeHead(200).end();
      } else if (method === 'GET') {
        response.writeHead(200).end(getNamespaceJSON(namespace));
      } else if (method === 'POST') {
        const functionName = url
          .substr(endpoint.length)
          .split('/')
          .filter(x => !!x);

        const functionArguments = JSON.parse(
          Buffer.concat(bodyChunks).toString()
        );

        const f = findFunction(functionName, namespace);
        if (f === undefined) {
          console.error('Unknown function requested ' + functionName);
          response.writeHead(404);
          response.end();
        } else {
          try {
            const result = await f(...functionArguments);
            response.writeHead(200);
            response.end(JSON.stringify(result));
          } catch (e) {
            response.setHeader('x-exception', e.constructor.name);
            response.writeHead(500);
            response.end(JSON.stringify(e));
          }
        }
      }
    });

  return true;
};

module.exports = requestHandler;
