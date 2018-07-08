#!/bin/bash

set -eu

docker build . --pull -f Dockerfile.dev -t mlg2048
docker run -ti -p 3000:80 -v $PWD/src/:/etc/mlg2048/src mlg2048
