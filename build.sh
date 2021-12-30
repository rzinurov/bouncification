#!/bin/bash

rm -rf ./dist

parcel build src/client/index.html --out-dir dist/client

tsc --project tsconfig.server.json

cp package.json ./dist/server
cp arena.env ./dist/server

mkdir ./dist/server/static
cp -R ./src/server/static/* ./dist/server/static
cp -R ./dist/client/* ./dist/server/static
