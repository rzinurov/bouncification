#!/bin/bash

rm -rf ./dist/server

tsc --project tsconfig.server.json

cp package.json ./dist/server
cp arena.env ./dist/server
mkdir ./dist/server/public
cp -R ./src/server/public/* ./dist/server/public

parcel build src/client/index.html --out-dir ./dist/client
cp -R ./dist/client/*  ./dist/server/public

