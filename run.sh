#!/bin/sh
for x in .*; do
    if ! grep -q '.env' "$x"; then continue; fi

    echo "[run.sh::env] sourcing $x"

    # shellcheck disable=SC1090
    . "$x"
done

node dist/index.js
