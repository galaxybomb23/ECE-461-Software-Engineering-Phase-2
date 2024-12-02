#!/bin/bash

# Define the base URL for the API
BASE_URL="http://dl-berlin.ecn.purdue.edu:8000"

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found. Please create one with the GITHUB_TOKEN variable."
  exit 1
fi

if [[ -z "$GITHUB_TOKEN" ]]; then
  echo "GITHUB_TOKEN is not set in the .env file."
  exit 1
fi

# Function to register
register() {
  curl --location "$BASE_URL/register" \
  --header 'Content-Type: application/json' \
  --data '{
    "group": 1,
    "github": "https://github.com/galaxybomb23/ECE-461-Software-Engineering-Phase-2",
    "names": [
        "Elijah Jorgensen", "Cooper Rockwell", "Tom Odonnel", "Rushil Shaw"
    ],
    "gh_token": "'"${GITHUB_TOKEN}"'",
    "endpoint": "http://54.224.103.25/api",
    "fe_endpoint": "http://54.224.103.25/"
  }'
}

# Function to schedule a run
schedule() {
  echo "Scheduling run for group 1..."
  curl --location "$BASE_URL/schedule" \
  --header 'Content-Type: application/json' \
  --data '{
    "group": "1",
    "gh_token": "'"${GITHUB_TOKEN}"'"
  }'
}

# Function to monitor all runs
monitor_runs() {
  curl --location "$BASE_URL/run/all" \
  --header 'Content-Type: application/json'
}

# Function to get the best run score
best_run() {
  curl --location "$BASE_URL/best_run" \
  --header 'Content-Type: application/json'
}

# Function to get the latest run score
last_run() {
  curl --location "$BASE_URL/last_run" \
  --header 'Content-Type: application/json'
}

# Parse flags and execute corresponding function
case "$1" in
  "register")
    register
    ;;
  "schedule")
    schedule 
    ;;
  "monitor")
    monitor_runs
    ;;
  "best")
    best_run
    ;;
  "last")
    last_run
    ;;
  *)
    echo "Usage: $0 {register|schedule|monitor|best|last}"
    exit 1
    ;;
esac
