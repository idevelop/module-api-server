const ensurePrefix = (string, prefix) =>
  string.startsWith(prefix) ? string : prefix + string;

const ensureSuffix = (string, suffix) =>
  string.endsWith(suffix) ? string : string + suffix;

const ensurePrefixAndSuffix = (string, prefix, suffix = prefix) =>
  ensurePrefix(ensureSuffix(string, suffix), prefix);

module.exports = { ensurePrefix, ensureSuffix, ensurePrefixAndSuffix };
