#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FEATURE_SET="${SCRIPT_DIR}/feature-sets/production.json"
TOGGLE_BLAKE3=false

case "${1:-}" in
  --blake3|-b)
    FEATURE_SET="${SCRIPT_DIR}/feature-sets/blake3-on.json"
    TOGGLE_BLAKE3=true
    shift
    ;;
  --production|-p)
    FEATURE_SET="${SCRIPT_DIR}/feature-sets/production.json"
    shift
    ;;
  "")
    FEATURE_SET="${SCRIPT_DIR}/feature-sets/production.json"
    ;;
esac

if solana-test-validator --help | grep feature-set > /dev/null; then
  echo "feature-set: ${FEATURE_SET}"
  exec solana-test-validator --feature-set "${FEATURE_SET}" "$@"
else
  echo "feature-set flag not supported, falling back to runtime activation"
  if [ "$TOGGLE_BLAKE3" = true ]; then
    (
      while ! solana cluster-version >/dev/null 2>&1; do
        sleep 1
      done
      solana config set --url localhost
      solana feature activate HTW2pSyErTj4BV6KBM9NZ9VBUJVxt7sacNWcf76wtzb3 || true
    ) &
    exec solana-test-validator "$@"
  else
    exec solana-test-validator --deactivate-feature HTW2pSyErTj4BV6KBM9NZ9VBUJVxt7sacNWcf76wtzb3 "$@"
  fi
fi
