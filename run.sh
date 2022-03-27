#!/bin/sh
for x in $(ls -a | grep .env); do
    echo "[run.sh::env] sourcing $x as env variables"
    source $x
done

node dist/index.js
