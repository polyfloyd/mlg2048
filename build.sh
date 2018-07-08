#!/bin/bash

set -eu

rm -rf ./dist
docker build . --pull -f Dockerfile -t mlg2048
id=$(docker run -d mlg2048)
docker cp $id:/usr/share/nginx/html ./dist
docker kill $id
