module.exports = {
  apps : [{
    name: 'hawaii-holdem',
    script: './lib/index.js',
    watch: 'false',
    instances: 4,
    exec_mode: 'cluster',

    env: {
	NODE_ENV: 'production',
    },    
  }],
};
