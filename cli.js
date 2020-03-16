#!/usr/bin/env node

const args = require('gar')(process.argv.slice(2));
const http = require('http');
const path = require('path');
const { server } = require('.');

const port = args.port || args.p;
const endpoint = args.endpoint || '/';
const cors = !!args.cors;

const modulePaths = (args['_'] || []).map(relativePath =>
  path.resolve(process.env.PWD, relativePath)
);

if (modulePaths.length == 0) {
  console.log(
    'Usage: npx module-api-server [-p PORT] [--cors] path/to/module path/to/another/module'
  );
  return;
}

const { handler } = server({
  paths: modulePaths,
  endpoint,
  cors,
});

const httpServer = http.createServer(handler).listen(port);

console.log(
  `Serving on port ${httpServer.address().port}, endpoint: ${endpoint}, CORS ${
    cors ? 'enabled' : 'disabled'
  }`
);
