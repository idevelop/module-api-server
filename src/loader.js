const { sep } = require('path');

module.exports = ({ paths = [], modules = {} }) => {
  const namespace = modules;

  for (let path of paths) {
    const m = require(path);
    if (m.constructor.name === 'Object') {
      // TODO: merge instead of overwrite
      Object.assign(namespace, m);
    } else {
      const keyPath = require.resolve(path).split(sep);
      const mName = keyPath[keyPath.length - 2];
      namespace[mName] = m;
    }
  }

  return namespace;
};
