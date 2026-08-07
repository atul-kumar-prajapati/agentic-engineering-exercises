/**
 * Starter transform. Replace this identity transform with the bounded migration.
 * The verification command must fail until the real transform matches the
 * expected fixture and remains idempotent.
 */
module.exports = function transform(fileInfo) {
  return fileInfo.source;
};
