#!/bin/bash

set -eu

docker build . --pull -f Dockerfile -t mlg2048
id=$(docker run -d mlg2048)
rm -rf ./dist
docker cp $id:/usr/share/nginx/html ./dist
docker kill $id
