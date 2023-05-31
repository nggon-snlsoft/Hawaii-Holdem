#!/usr/bin/env bash

cd ..
git pull
cd server
sudo forever stopall
sudo NODE_ENV='production' forever start -a -l ~/log/log.log -e ~/log/err.log -m 5 ./lib/index.js