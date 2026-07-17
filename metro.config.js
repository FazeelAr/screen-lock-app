const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure Metro treats WebAssembly files as assets so imports like
// "./wa-sqlite/wa-sqlite.wasm" resolve correctly for web builds.
config.resolver.assetExts.push('wasm');

module.exports = config;
