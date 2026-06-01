#!/usr/bin/env bash
# Shared helpers for check-web GitHub Actions workflows.

wait_for_url() {
  local url="$1"
  local max_attempts="${2:-3000}"
  local count=0

  until curl --silent -I -f --fail "$url" || [ "$count" -eq "$max_attempts" ]; do
    printf .
    sleep 1
    count=$((count + 1))
  done

  if [ "$count" -eq "$max_attempts" ]; then
    echo "Timed out waiting for ${url} after ${count} attempts"
    exit 1
  fi
}

run_similarity_phase() {
  local job_name="$1"
  export GITHUB_JOB_NAME="$job_name"

  echo "Starting ${job_name}..."
  ./build.sh
  wait_for_url http://localhost:3333

  docker compose exec web npm run linter
  docker compose exec web npm run test:integration:lint

  docker compose exec web service nginx start
  docker compose -f docker-compose.yml -f docker-test.yml exec chromedriver service nginx start
  docker compose exec -T \
    -e IMGUR_CLIENT_ID="${IMGUR_CLIENT_ID}" \
    -e GITHUB_JOB_NAME="${GITHUB_JOB_NAME}" \
    -e GITHUB_BRANCH="${GITHUB_BRANCH}" \
    -e AWS_ENDPOINT="${AWS_ENDPOINT}" \
    -e AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" \
    -e AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" \
    -e ROLE_TO_ASSUME="${AWS_ROLE_TO_ASSUME}" \
    -e AWS_REGION=eu-west-1 \
    -e TEST_RETRY_COUNT=3 \
    web npm run tests
}

teardown_compose_stack() {
  docker compose -f docker-compose.yml -f docker-test.yml down -v --remove-orphans 2>/dev/null || true
  if pgrep -x ngrok >/dev/null 2>&1; then
    kill -9 "$(pgrep -x ngrok)" || true
  fi
  docker builder prune -af 2>/dev/null || true
}
