#!/usr/bin/env bash

REQUIREMENT_FILE=${1:-requirements_and_plans/requirements/2020/cs.json}
PLAN_FILE=${2:-./requirements_and_plans/test_study_plans/cs-2020-ZhongFu.json}

TS_NODE_PROJECT="tsconfig.compile.json" \
ts-node -T src/tests/index.ts "$REQUIREMENT_FILE" "$PLAN_FILE" | 
tee "out/test-$(basename "${REQUIREMENT_FILE}")-$(basename "${PLAN_FILE}").log" |
less
