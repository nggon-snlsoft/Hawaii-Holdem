module.exports = {
  apps : [{
    name: 'hawaii-holdem',
    script: './lib/index.js',
    watch: 'false',
    instances: 1,
    exec_mode: 'fork',

    env: {
	NODE_ENV: 'production',
    },    
  }],
};
