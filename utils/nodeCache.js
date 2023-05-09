const NodeCache = require('node-cache');

/**
 * @author
 * @description A simple node cache
 */
const myCache = new NodeCache({ stdTTL: 420, checkperiod: 440 });

module.exports = myCache;

/**
 * Notes
 * Check out
 * https://www.npmjs.com/package/lru-cache
 * much faster and more stable
 */
