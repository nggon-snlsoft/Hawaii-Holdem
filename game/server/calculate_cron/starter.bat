set NODE_ENV=production
forever stopall
forever api/lib/index.js
