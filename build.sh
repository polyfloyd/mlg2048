#!/bin/bash

set -eu

docker build . --pull -f Dockerfile -t mlg2048
id=$(docker run -d mlg2048)
rm -rf ./docs
docker cp $id:/usr/share/nginx/html ./docs
docker kill $id
