#!/bin/bash

cp $KLAYTN_CONTRACT_DEPLOYMENT_DIR/networks-DexFactory.json /app/subgraphs/exchange/networks.json
cp $KLAYTN_CONTRACT_DEPLOYMENT_DIR/networks-Farming.json /app/subgraphs/farming/networks.json
cp $KLAYTN_CONTRACT_DEPLOYMENT_DIR/networks-StakingFactory.json /app/subgraphs/staking/networks.json

yarn codegen
yarn build --network $KLAYTN_NETWORK
yarn create-remote
yarn deploy-remote --network $KLAYTN_NETWORK
