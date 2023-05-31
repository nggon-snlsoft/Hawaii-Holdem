const os = require('os');

module.exports = {
  apps : [{
    port: 8000,
    name: 'hawaii-holdem',
    script: './lib/index.js',
    watch: 'false',
    instances: 4,
    exec_mode: 'fork',

    env: {
	    NODE_ENV: 'production',
    },    
  }],
};
