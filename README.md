MLG 2048
========

2048 BLAZE IT

Dev:
```sh
docker build . -f Dockerfile.dev -t mlg2048
docker run -p 3000:80 -v $PWD/src/:/etc/mlg2048/src mlg2048
```
Prod:
```sh
docker build . -f Dockerfile -t mlg2048
docker run -p 3000:80 mlg2048
```
