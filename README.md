# Experiments

UI to view experiment data/rollout.

Needs Yarn, Rust, Python and MongoDB.

## Setup

```
git submodule update --recursive --remote --init
yarn install
cd heimdall && cargo build; cd ..
cd himinsbjörg && pip3 install -r requirements.txt; cd ..
```

## Running

| Component   | Command            |
| ----------- | ------------------ |
| Heimdall    | `cargo run`        |
| Himinsbjörg | `python3 main.py`  |
| Website     | `yarn dev -p 3001` |

## Production

| Component   | Command                                         |
| ----------- | ----------------------------------------------- |
| Heimdall    | `cargo build --release` / `cargo run --release` |
| Himinsbjörg | `python3 main.py`                               |
| Website     | `yarn build` / `yarn start`                     |
