@echo off
timeout /t 5 /nobreak
taskkill /F /IM node.exe
set NODE_ENV=production
forever api/lib/index.js
forever game/lib/index.js
