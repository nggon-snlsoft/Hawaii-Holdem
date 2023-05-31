cd ..
git pull
cd server
forever stopall

set NODE_ENV=production
forever start -a -l "C:\HawaiiHoldem\Logs\Game\log.log" -e "C:\HawaiiHoldem\Logs\Game\err.log" -m 5 ./lib/index.js
