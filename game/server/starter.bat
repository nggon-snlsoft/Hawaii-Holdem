set NODE_ENV=production
taskkill /F /IM node.exe
forever api/lib/index.js

