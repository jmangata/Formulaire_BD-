function info(msg) {
  console.log(`ℹ️  ${msg}`);
}

function success(msg) {
  console.log(`✅ ${msg}`);
}

function error(msg) {
  console.error(`❌ ${msg}`);
}

function warn(msg) {
  console.log(`⚠️  ${msg}`);
}

module.exports = {
  info,
  success,
  error,
  warn
};