cd ..
git pull
cd server
forever stopall
NODE_ENV='production' forever start -a -l "C:\_works\projectTH\server\lib\logs\log.log" -e "C:\_works\projectTH\server\lib\logs\err.log" -m 5 ./lib/index.js