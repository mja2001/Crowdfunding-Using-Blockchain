#!/bin/bash
set -e
anchor build
anchor deploy --provider.cluster devnet
