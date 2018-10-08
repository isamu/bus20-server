# test server for bus20

This is based on https://github.com/isamu/aws_sam_sample

## install sam tool

$ pip install -r requirements.txt

## run docker

```
$ docker-machine start default
$ eval "$(docker-machine env default)"
```

## install npm package

```
cd src
npm install
```

# run lambda + API gateway server

```
$ sam local start-api
```

