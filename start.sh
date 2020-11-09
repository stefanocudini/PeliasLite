#!/bin/bash

D="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
#D=$(dirname $DIR)


export PELIAS_CONFIG=$D/pelias.json
#default PORT=3100
#echo $PELIAS_CONFIG

npm run start
