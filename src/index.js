const requestHandler = require('./request-handler');
const loader = require('./loader');
const client = require('./client');

module.exports = ({
  paths = [],
  modules = {},
  endpoint = '/',
  cors = false,
}) => {
  const namespace = loader({ paths, modules });
  console.log('Loaded namespace', namespace);

  // standard http server request handler
  const handler = requestHandler(namespace, { endpoint, cors });

  // express middleware
  const middleware = (request, response, next) => {
    if (!handler(request, response)) {
      next();
    }
  };

  return { handler, middleware, client };
};
